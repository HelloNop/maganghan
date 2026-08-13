/**
 * Client-side utility to upload files directly to Cloudflare R2 via Presigned URL.
 * Bypasses Vercel Serverless Functions for better performance.
 */

interface PresignResponse {
  uploadUrl: string;
  objectKey: string;
}

export async function uploadToR2(
  file: Blob,
  folder: string
): Promise<string> {
  // 1. Get presigned URL from our API
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder,
      contentType: file.type || "image/webp",
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.json();
    throw new Error(err.error || "Gagal mendapatkan URL upload.");
  }

  const { uploadUrl, objectKey }: PresignResponse = await presignRes.json();

  // 2. Upload directly to R2
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/webp" },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Gagal mengunggah file. Silakan coba lagi.");
  }

  return objectKey;
}

/**
 * Converts a base64 Data URL to a Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64Data] = dataUrl.split(",");
  const mimeMatch = header.match(/data:([^;]+)/);
  const mime = mimeMatch ? mimeMatch[1] : "image/webp";
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
