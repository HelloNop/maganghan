import { NextRequest, NextResponse } from "next/server";
import { getImageFromR2 } from "@/lib/utils/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  if (!key || key.length === 0) {
    return new NextResponse("Image key missing", { status: 400 });
  }

  const objectKey = key.join("/");
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
