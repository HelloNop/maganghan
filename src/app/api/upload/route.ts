import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBufferToR2 } from "@/lib/utils/r2";

const ALLOWED_FOLDERS = ["checkin", "checkout", "surat_izin", "attendance"];
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
    return NextResponse.json(
      { error: "Sesi telah berakhir. Silakan login kembali." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const folder = (formData.get("folder") as string) || "attendance";

    if (!file) {
      return NextResponse.json(
        { error: "File foto tidak ditemukan." },
        { status: 400 }
      );
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: "Folder penyimpanan tidak valid." },
        { status: 400 }
      );
    }

    const contentType = file.type || "image/webp";
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Format file tidak didukung: " + contentType },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBufferToR2(buffer, contentType, folder);
    if (!result) {
      return NextResponse.json(
        { error: "Gagal menyimpan file ke penyimpanan Cloudflare R2." },
        { status: 500 }
      );
    }

    return NextResponse.json({ objectKey: result.objectKey });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunggah file." },
      { status: 500 }
    );
  }
}
