import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.FILES_BASE_ENDPOINT ?? "https://s3.filebase.io";
const region = process.env.FILES_BASE_REGION ?? "auto";
const accessKeyId = process.env.FILES_BASE_ACCESS_KEY;
const secretAccessKey = process.env.FILES_BASE_SECRET;
const bucket = process.env.FILES_BASE_BUCKET;

if (!accessKeyId || !secretAccessKey || !bucket) {
    console.warn(
        "[filebase] Missing FILES_BASE_ACCESS_KEY / FILES_BASE_SECRET / FILES_BASE_BUCKET",
    );
}

export const filebaseBucket = bucket ?? "";

export const filebaseClient = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: {
        accessKeyId: accessKeyId ?? "",
        secretAccessKey: secretAccessKey ?? "",
    },
});

/**
 * Stable internal URL stored in `resources.url`. Resolved at request time
 * by `/api/files/[...key]` which redirects to a fresh presigned URL.
 */
export function internalFileUrl(key: string) {
    return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function presignedGetUrl(key: string, expiresInSeconds = 3600) {
    return getSignedUrl(
        filebaseClient,
        new GetObjectCommand({ Bucket: filebaseBucket, Key: key }),
        { expiresIn: expiresInSeconds },
    );
}

export type UploadResult = {
    key: string;
    url: string;
    size: number;
    contentType: string;
};

export async function uploadToFilebase(
    file: File,
    opts?: { prefix?: string },
): Promise<UploadResult> {
    if (!filebaseBucket) throw new Error("Filebase bucket not configured");

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const prefix = opts?.prefix ? `${opts.prefix.replace(/\/$/, "")}/` : "";
    const key = `${prefix}${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const contentType = file.type || "application/octet-stream";

    await filebaseClient.send(
        new PutObjectCommand({
            Bucket: filebaseBucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }),
    );

    return {
        key,
        url: internalFileUrl(key),
        size: buffer.byteLength,
        contentType,
    };
}

export async function deleteFromFilebase(key: string) {
    if (!filebaseBucket || !key) return;
    await filebaseClient.send(
        new DeleteObjectCommand({ Bucket: filebaseBucket, Key: key }),
    );
}
