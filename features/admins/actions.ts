"use server";

import { getAdmin } from "@/features/auth/require-admin";
import { users } from "@/features/auth/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function appOrigin() {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    return host ? `${proto}://${host}` : "";
}

// Appel direct à l'API Neon Auth sans propager/écrire les cookies de session :
// on évite ainsi que la création du compte ne reconnecte l'admin courant en
// tant que nouvel utilisateur.
async function neonAuthFetch(path: string, body: Record<string, unknown>) {
    const base = process.env.NEON_AUTH_BASE_URL!;
    const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
    const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: await appOrigin(),
            "x-neon-auth-proxy": "nextjs",
        },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
}

export async function inviteAdmin(rawEmail: string, rawName: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        const email = rawEmail.trim().toLowerCase();
        const name = rawName.trim();
        if (!email) return { error: "Email requis" };
        if (!EMAIL_RE.test(email)) return { error: "Email invalide" };
        if (!name) return { error: "Nom requis" };

        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing.length > 0 && existing[0].isAdmin) {
            return { error: "Cet email est déjà admin" };
        }

        if (existing.length > 0) {
            await db
                .update(users)
                .set({ isAdmin: true, name })
                .where(eq(users.id, existing[0].id));
        } else {
            const signUp = await neonAuthFetch("sign-up/email", {
                email,
                password: crypto.randomUUID() + crypto.randomUUID(),
                name,
            });

            const authUserId = signUp.data?.user?.id;
            if (!signUp.ok || !authUserId) {
                const message =
                    signUp.data?.message ??
                    signUp.data?.error?.message ??
                    "Échec de la création du compte";
                return { error: message };
            }

            await db.insert(users).values({
                authUserId,
                email,
                name,
                isAdmin: true,
            });
        }

        const reset = await neonAuthFetch("request-password-reset", {
            email,
            redirectTo: `${await appOrigin()}/manager/reset-password`,
        });

        revalidatePath("/manager/admins");
        return { email, emailSent: reset.ok };
    } catch (err) {
        console.error("[inviteAdmin] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Échec de la création",
        };
    }
}

export async function revokeAdmin(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };
        if (admin.user.id === id) {
            return { error: "Vous ne pouvez pas révoquer votre propre accès" };
        }

        await db.update(users).set({ isAdmin: false }).where(eq(users.id, id));
        revalidatePath("/manager/admins");
        return { success: true };
    } catch (err) {
        console.error("[revokeAdmin] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Échec de la révocation",
        };
    }
}

export async function restoreAdmin(id: string) {
    try {
        const admin = await getAdmin();
        if (!admin.ok) return { error: admin.error };

        await db.update(users).set({ isAdmin: true }).where(eq(users.id, id));
        revalidatePath("/manager/admins");
        return { success: true };
    } catch (err) {
        console.error("[restoreAdmin] failed:", err);
        return {
            error: err instanceof Error ? err.message : "Échec",
        };
    }
}
