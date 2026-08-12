import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 Storage Utility (S3-Compatible)
 * 100% Free 10 GB Storage with Zero Egress Fees
 */

function getR2Client(): { client: S3Client; bucketName: string; publicDomain: string } | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "maganghan-attendance";
  const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || "";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucketName, publicDomain };
}

/**
 * Uploads a base64 Data URL (image) to Cloudflare R2 Bucket.
 * Fallback to base64 Data URL if Cloudflare R2 environment variables are not set.
 */
export async function uploadImageToR2(
  dataUrl: string,
  folder: string = "attendance"
): Promise<string> {
  const r2 = getR2Client();

  if (!r2) {
    console.warn(
      "Cloudflare R2 env vars not configured. Returning base64 Data URL fallback."
    );
    return dataUrl;
  }

  try {
    // 1. Extract base64 payload & content type
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already a HTTP URL, return as is
      if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
        return dataUrl;
      }
      return dataUrl;
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // 2. Generate unique key filename
    const ext = contentType.split("/")[1] || "webp";
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    // 3. Upload to Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: r2.bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    });

    await r2.client.send(command);

    // 4. Construct Public or Custom Domain URL
    if (r2.publicDomain) {
      const baseUrl = r2.publicDomain.endsWith("/")
        ? r2.publicDomain.slice(0, -1)
        : r2.publicDomain;
      return `${baseUrl}/${filename}`;
    }

    return `https://${r2.bucketName}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${filename}`;
  } catch (error) {
    console.error("Cloudflare R2 upload error:", error);
    // Return original data URL as fallback so app never crashes
    return dataUrl;
  }
}
