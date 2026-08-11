import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 Data URL (image) to Cloudinary.
 * Fallback to dummy data URL if Cloudinary credentials are not configured.
 */
export async function uploadImageToCloudinary(
  dataUrl: string,
  folder: string = "attendance"
): Promise<string> {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!isCloudinaryConfigured) {
    console.warn("Cloudinary env vars not set. Returning data URL fallback.");
    return dataUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: `maganghan/${folder}`,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    // Return original data URL as fallback so the app continues working gracefully
    return dataUrl;
  }
}
