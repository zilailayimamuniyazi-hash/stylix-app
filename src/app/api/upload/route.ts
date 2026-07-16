import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const UPLOAD_RATE_WINDOW_MS = 60_000;
const UPLOAD_RATE_MAX = 5;
const uploadBuckets = new Map<string, { count: number; resetAt: number }>();

function isUploadRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = uploadBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    uploadBuckets.set(ip, { count: 1, resetAt: now + UPLOAD_RATE_WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > UPLOAD_RATE_MAX;
}

function hasValidImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg" || type === "image/jpg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isUploadRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 }
    );
  }
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      console.error("[upload] Rejected: content-type is not multipart/form-data", contentType);
      return NextResponse.json(
        { error: "Request must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      console.error("[upload] Rejected: no file field in form data");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // MIME type guard
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error("[upload] Rejected: unsupported MIME type", file.type);
      return NextResponse.json(
        {
          error: `File type "${file.type}" is not supported. Allowed: jpg, png, webp.`,
        },
        { status: 415 }
      );
    }

    // Size guard
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.error(
        "[upload] Rejected: file too large",
        `${(file.size / 1024 / 1024).toFixed(2)} MB`
      );
      return NextResponse.json(
        { error: `File exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB received).` },
        { status: 413 }
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    if (!hasValidImageSignature(buffer, file.type)) {
      return NextResponse.json({ error: "The uploaded file is not a valid image." }, { status: 415 });
    }

    const db = getSupabaseAdmin();
    const bucket = "user-uploads";
    const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
    const month = new Date().toISOString().slice(0, 7);
    const path = `${month}/${randomUUID()}.${ext}`;
    let result = await db.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

    if (result.error?.message.toLowerCase().includes("bucket")) {
      const created = await db.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE_BYTES,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
      if (!created.error || created.error.message.toLowerCase().includes("already")) {
        result = await db.storage.from(bucket).upload(path, buffer, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });
      }
    }

    if (result.error) {
      console.error("[upload] storage failed", { message: result.error.message });
      return NextResponse.json({ error: "Image storage is temporarily unavailable." }, { status: 503 });
    }

    const { data } = db.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error during upload." }, { status: 500 });
  }
}
