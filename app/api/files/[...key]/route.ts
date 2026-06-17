import { presignedGetUrl } from "@/features/storage/filebase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ key: string[] }> },
) {
    const { key } = await params;
    if (!key || key.length === 0) {
        return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const objectKey = key.map((p) => decodeURIComponent(p)).join("/");

    try {
        const url = await presignedGetUrl(objectKey, 3600);
        return NextResponse.redirect(url, 302);
    } catch (err) {
        console.error("[/api/files] presign failed:", err);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}
