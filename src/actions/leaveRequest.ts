"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leaveRequests, attendance } from "@/lib/db/schema";
import { uploadImageToCloudinary } from "@/lib/utils/cloudinary";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const jenis = formData.get("jenis") as "izin" | "sakit";
  const tanggalMulai = formData.get("tanggalMulai") as string;
  const tanggalSelesai = formData.get("tanggalSelesai") as string;
  const keterangan = formData.get("keterangan") as string;
  const file = formData.get("fileSurat") as File | null;

  if (!jenis || !tanggalMulai || !tanggalSelesai || !keterangan) {
    return { error: "Semua kolom bertanda * wajib diisi." };
  }

  try {
    let fileSuratUrl: string | undefined = undefined;

    if (file && file.size > 0) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = file.type || "application/pdf";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      fileSuratUrl = await uploadImageToCloudinary(dataUrl, "surat_izin");
    }

    await db.insert(leaveRequests).values({
      userId: session.user.id,
      jenis,
      tanggalMulai,
      tanggalSelesai,
      keterangan,
      fileSuratUrl,
      statusApproval: "pending",
    });

    revalidatePath("/intern/izin");

    return { success: true };
  } catch (error) {
    console.error("Submit leave request error:", error);
    return { error: "Gagal mengajukan izin. Silakan coba lagi." };
  }
}

export async function getLeaveRequestsAction() {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.userId, session.user.id))
      .orderBy(desc(leaveRequests.createdAt));
  } catch (error) {
    console.error("Fetch leave requests error:", error);
    return [];
  }
}

export async function getAttendanceHistoryAction() {
  const session = await auth();
  if (!session?.user) return [];

  try {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.userId, session.user.id))
      .orderBy(desc(attendance.tanggal));
  } catch (error) {
    console.error("Fetch attendance history error:", error);
    return [];
  }
}
