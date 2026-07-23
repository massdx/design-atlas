"use server";

import { getAdmin } from "@/features/auth/require-admin";
import { categories } from "@/features/categories/schema";
import { notifyManagersOfNewResource } from "@/features/notifications/resource-submitted";
import { deleteFromFilebase, uploadToFilebase } from "@/features/storage/filebase";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { resources } from "./schema";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const METADATA_FETCH_TIMEOUT_MS = 6000;
const METADATA_MAX_BYTES = 512 * 1024; // 512 KB suffit pour les <head>

function errorMessage(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback;
}

function parseTags(raw: string) {
    return raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t, i, arr) => t.length > 0 && arr.indexOf(t) === i)
        .slice(0, 10);
}

export type UrlMetadata = {
    title: string;
    description: string;
    image: string;
};

function decodeHtmlEntities(s: string) {
    return s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
            String.fromCharCode(parseInt(n, 16)),
        );
}

function matchMeta(html: string, attr: "property" | "name", key: string) {
    const re = new RegExp(
        `<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']+)["']`,
        "i",
    );
    const m = html.match(re);
    if (m) return decodeHtmlEntities(m[1].trim());
    const re2 = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${key}["']`,
        "i",
    );
    const m2 = html.match(re2);
    return m2 ? decodeHtmlEntities(m2[1].trim()) : "";
}

function absoluteUrl(maybeUrl: string, base: string) {
    if (!maybeUrl) return "";
    try {
        return new URL(maybeUrl, base).toString();
    } catch {
        return "";
    }
}

export async function fetchUrlMetadata(
    rawUrl: string,
): Promise<{ data?: UrlMetadata; error?: string }> {
    const url = rawUrl.trim();
    if (!url) return { error: "URL is required" };

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return { error: "URL is invalid" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { error: "URL must be http(s)" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), METADATA_FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(parsed.toString(), {
            signal: controller.signal,
            redirect: "follow",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; DesignAtlasBot/1.0; +https://design-atlas.app)",
                Accept: "text/html,application/xhtml+xml",
            },
        });
        if (!res.ok) return { error: `HTTP ${res.status}` };

        const reader = res.body?.getReader();
        if (!reader) return { error: "Empty response" };

        const decoder = new TextDecoder("utf-8", { fatal: false });
        let html = "";
        let received = 0;
        while (received < METADATA_MAX_BYTES) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.byteLength;
            html += decoder.decode(value, { stream: true });
            if (/<\/head>/i.test(html)) break;
        }
        try {
            await reader.cancel();
        } catch {
            // ignore
        }

        const ogTitle = matchMeta(html, "property", "og:title");
        const twTitle = matchMeta(html, "name", "twitter:title");
        const htmlTitle = (() => {
            const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            return m ? decodeHtmlEntities(m[1].trim()) : "";
        })();

        const ogDesc = matchMeta(html, "property", "og:description");
        const twDesc = matchMeta(html, "name", "twitter:description");
        const metaDesc = matchMeta(html, "name", "description");

        const ogImage =
            matchMeta(html, "property", "og:image:secure_url") ||
            matchMeta(html, "property", "og:image:url") ||
            matchMeta(html, "property", "og:image");
        const twImage = matchMeta(html, "name", "twitter:image");

        return {
            data: {
                title: ogTitle || twTitle || htmlTitle,
                description: ogDesc || twDesc || metaDesc,
                image: absoluteUrl(ogImage || twImage, parsed.toString()),
            },
        };
    } catch (err) {
        if ((err as Error).name === "AbortError") {
            return { error: "Timeout while fetching URL" };
        }
        console.error("[fetchUrlMetadata] failed:", err);
        return { error: errorMessage(err, "Failed to fetch URL") };
    } finally {
        clearTimeout(timeout);
    }
}

export async function submitResource(formData: FormData) {
    try {
        const title = String(formData.get("title") ?? "").trim();
        const url = String(formData.get("url") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const categoryId = String(formData.get("categoryId") ?? "").trim();
        const imageUrl = String(formData.get("imageUrl") ?? "").trim();
        const submittedByEmail = String(formData.get("email") ?? "").trim();
        const tagsRaw = String(formData.get("tags") ?? "").trim();
        const tags = tagsRaw ? parseTags(tagsRaw) : [];

        if (!title) return { error: "Title is required" };
        if (!url) return { error: "URL is required" };
        if (!categoryId) return { error: "Category is required" };
        try {
            new URL(url);
        } catch {
            return { error: "URL is invalid" };
        }
        if (imageUrl) {
            try {
                new URL(imageUrl);
            } catch {
                return { error: "Image URL is invalid" };
            }
        }

        await db.insert(resources).values({
            title,
            url,
            description: description || null,
            categoryId: categoryId || null,
            imageUrl: imageUrl || null,
            tags,
            submittedByEmail: submittedByEmail || null,
            status: "pending",
        });

        revalidatePath("/manager");

        try {
            let categoryName: string | null = null;
            if (categoryId) {
                const [cat] = await db
                    .select({ name: categories.name })
                    .from(categories)
                    .where(eq(categories.id, categoryId))
                    .limit(1);
                categoryName = cat?.name ?? null;
            }
            await notifyManagersOfNewResource({
                title,
                url,
                description: description || null,
                categoryName,
                submittedByEmail: submittedByEmail || null,
            });
        } catch (err) {
            console.error("[submitResource] notification failed:", err);
        }

        return { success: true };
    } catch (err) {
        console.error("[submitResource] failed:", err);
        return { error: errorMessage(err, "Failed to submit resource") };
    }
}

export async function createResourceAsAdmin(formData: FormData) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };
        const moderator = admin.user;

        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const categoryId = String(formData.get("categoryId") ?? "").trim();
        const imageUrl = String(formData.get("imageUrl") ?? "").trim();
        const type = String(formData.get("type") ?? "external").trim() as
            | "external"
            | "file";

        if (!title) return { error: "Title is required" };

        const tags = parseTags(String(formData.get("tags") ?? "").trim());

        if (imageUrl) {
            try {
                new URL(imageUrl);
            } catch {
                return { error: "Image URL is invalid" };
            }
        }

        let url = "";
        let fileKey: string | null = null;
        let fileSize: string | null = null;
        let fileMimeType: string | null = null;

        if (type === "file") {
            const file = formData.get("file");
            if (!(file instanceof File) || file.size === 0) {
                return { error: "File is required" };
            }
            if (file.size > MAX_UPLOAD_BYTES) {
                return { error: "File exceeds 5 MB limit" };
            }
            try {
                const uploaded = await uploadToFilebase(file, { prefix: "resources" });
                url = uploaded.url;
                fileKey = uploaded.key;
                fileSize = String(uploaded.size);
                fileMimeType = uploaded.contentType;
            } catch (err) {
                console.error("[createResourceAsAdmin] upload failed:", err);
                return { error: errorMessage(err, "Upload failed") };
            }
        } else {
            url = String(formData.get("url") ?? "").trim();
            if (!url) return { error: "URL is required" };
            try {
                new URL(url);
            } catch {
                return { error: "URL is invalid" };
            }
        }

        await db.insert(resources).values({
            title,
            url,
            type,
            fileKey,
            fileSize,
            fileMimeType,
            description: description || null,
            categoryId: categoryId || null,
            imageUrl: imageUrl || null,
            tags,
            submittedByEmail: moderator.email,
            status: "approved",
            reviewedBy: moderator.id,
            reviewedAt: new Date(),
        });

        revalidatePath("/manager");
        revalidatePath("/");
        return { success: true };
    } catch (err) {
        console.error("[createResourceAsAdmin] failed:", err);
        return { error: errorMessage(err, "Failed to create resource") };
    }
}

export async function updateResource(formData: FormData) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        const id = String(formData.get("id") ?? "").trim();
        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const categoryId = String(formData.get("categoryId") ?? "").trim();
        const tags = parseTags(String(formData.get("tags") ?? "").trim());

        if (!id) return { error: "Resource id is required" };
        if (!title) return { error: "Title is required" };

        const [existing] = await db
            .select({ id: resources.id })
            .from(resources)
            .where(eq(resources.id, id))
            .limit(1);
        if (!existing) return { error: "Resource not found" };

        await db
            .update(resources)
            .set({
                title,
                description: description || null,
                categoryId: categoryId || null,
                tags,
                updatedAt: new Date(),
            })
            .where(eq(resources.id, id));

        revalidatePath("/manager");
        revalidatePath("/");
        return { success: true };
    } catch (err) {
        console.error("[updateResource] failed:", err);
        return { error: errorMessage(err, "Failed to update resource") };
    }
}

export async function approveResource(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };
        await db
            .update(resources)
            .set({
                status: "approved",
                reviewedBy: admin.user.id,
                reviewedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(resources.id, id));
        revalidatePath("/manager");
        revalidatePath("/");
        return { success: true };
    } catch (err) {
        console.error("[approveResource] failed:", err);
        return { error: errorMessage(err, "Failed to approve resource") };
    }
}

export async function rejectResource(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };
        await db
            .update(resources)
            .set({
                status: "rejected",
                reviewedBy: admin.user.id,
                reviewedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(resources.id, id));
        revalidatePath("/manager");
        return { success: true };
    } catch (err) {
        console.error("[rejectResource] failed:", err);
        return { error: errorMessage(err, "Failed to reject resource") };
    }
}

export async function deleteResource(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        const [row] = await db
            .select({ fileKey: resources.fileKey })
            .from(resources)
            .where(eq(resources.id, id))
            .limit(1);

        await db.delete(resources).where(eq(resources.id, id));

        if (row?.fileKey) {
            try {
                await deleteFromFilebase(row.fileKey);
            } catch (err) {
                console.error("[deleteResource] filebase delete failed:", err);
            }
        }

        revalidatePath("/manager");
        return { success: true };
    } catch (err) {
        console.error("[deleteResource] failed:", err);
        return { error: errorMessage(err, "Failed to delete resource") };
    }
}

