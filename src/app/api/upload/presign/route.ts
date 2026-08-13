import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePresignedUploadUrl } from "@/lib/utils/r2";

const ALLOWED_FOLDERS = ["checkin", "checkout", "surat_izin"];
const ALLOWED_CONTENT_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { folder, contentType } = body as { folder: string; contentType: string };

    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: "Invalid folder. Allowed: " + ALLOWED_FOLDERS.join(", ") },
        { status: 400 }
      );
    }

    if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid content type. Allowed: " + ALLOWED_CONTENT_TYPES.join(", ") },
        { status: 400 }
      );
    }

    const result = await generatePresignedUploadUrl(folder, contentType);

    if (!result) {
      return NextResponse.json(
        { error: "R2 storage not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Presign URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
