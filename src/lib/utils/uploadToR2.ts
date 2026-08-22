/**
 * Client-side utility to upload files to Cloudflare R2 via Next.js backend API.
 * Avoids browser CORS and network blocking issues with direct presigned URLs.
 */

export async function uploadToR2(
  file: Blob,
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Gagal mengunggah foto. Silakan coba lagi.");
  }

  const data = await res.json();
  return data.objectKey;
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
