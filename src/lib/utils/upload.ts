const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  url: string;
  localPreview: string; // always set — objectURL for instant display
}

export interface UploadError {
  message: string;
}

/**
 * Validates, creates a local preview URL, and POSTs to /api/upload.
 * Returns a stable Supabase Storage URL from the server
 * and a localPreview objectURL for instant display before the server responds.
 */
export async function uploadImage(
  file: File
): Promise<{ ok: true; result: UploadResult } | { ok: false; error: UploadError }> {
  // Client-side MIME guard
  if (!ALLOWED_MIME.includes(file.type as typeof ALLOWED_MIME[number])) {
    const msg = `Unsupported file type: "${file.type}". Please upload a JPG, PNG, or WebP image.`;
    console.error("[uploadImage] MIME rejected:", file.type);
    return { ok: false, error: { message: msg } };
  }

  // Client-side size guard
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(2);
    const msg = `File is too large (${mb} MB). Maximum allowed size is 5 MB.`;
    console.error("[uploadImage] Size rejected:", mb, "MB");
    return { ok: false, error: { message: msg } };
  }

  // Instant local preview
  const localPreview = URL.createObjectURL(file);

  try {
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      const msg = (data as { error?: string }).error ?? `Upload failed with status ${res.status}`;
      console.error("[uploadImage] Server rejected upload:", res.status, msg);
      // Still return the local preview so the UI can display something
      return { ok: false, error: { message: msg } };
    }

    const data = await res.json() as { url?: string };
    if (!data.url) {
      console.error("[uploadImage] Server response missing 'url' field", data);
      return { ok: false, error: { message: "Upload succeeded but server returned no URL." } };
    }

    console.log("[uploadImage] Upload complete:", data.url.slice(0, 80) + "…");
    return { ok: true, result: { url: data.url, localPreview } };
  } catch (err) {
    console.error("[uploadImage] Network/fetch error:", err);
    return {
      ok: false,
      error: { message: err instanceof Error ? err.message : "Network error during upload." },
    };
  }
}
