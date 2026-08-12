import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getImageFromR2 } from "@/lib/utils/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  // Auth check — only authenticated users can view images
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { key } = await params;
  if (!key || key.length === 0) {
    return new NextResponse("Image key missing", { status: 400 });
  }

  const objectKey = key.join("/");

  // Path traversal protection — only allow safe characters
  if (!/^[a-zA-Z0-9_\-/.]+$/.test(objectKey) || objectKey.includes("..")) {
    return new NextResponse("Invalid image key", { status: 400 });
  }

  const image = await getImageFromR2(objectKey);

  if (!image) {
    return new NextResponse("Image not found in R2", { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
