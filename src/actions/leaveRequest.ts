"use server";

import { auth } from "@/lib/auth";
import { leaveRequestSchema } from "@/lib/validators/leaveRequest";
import { db } from "@/lib/db";
import { leaveRequests, attendance } from "@/lib/db/schema";
import { uploadImageToR2 } from "@/lib/utils/r2";
import { eq, desc, and, or, gte, lte, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequestAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const userId = session.user.id;
  const jenis = formData.get("jenis") as "izin" | "sakit";
  const tanggalMulai = formData.get("tanggalMulai") as string;
  const tanggalSelesai = formData.get("tanggalSelesai") as string;
  const keterangan = formData.get("keterangan") as string;
  const file = formData.get("fileSurat") as File | null;

  const validated = leaveRequestSchema.safeParse({
    jenis,
    tanggalMulai,
    tanggalSelesai,
    keterangan,
  });

  if (!validated.success) {
    return {
      error: validated.error.errors[0]?.message || "Input tidak valid",
    };
  }

  // 1. Validate date order
  if (tanggalMulai > tanggalSelesai) {
    return { error: "Tanggal mulai tidak boleh lebih dari tanggal selesai." };
  }

  try {
    // 2. Check for overlapping pending or approved leave requests
    const overlapping = await db
      .select({
        id: leaveRequests.id,
        jenis: leaveRequests.jenis,
        tanggalMulai: leaveRequests.tanggalMulai,
        tanggalSelesai: leaveRequests.tanggalSelesai,
        statusApproval: leaveRequests.statusApproval,
      })
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.userId, userId),
          or(
            eq(leaveRequests.statusApproval, "pending"),
            eq(leaveRequests.statusApproval, "approved")
          ),
          lte(leaveRequests.tanggalMulai, tanggalSelesai),
          gte(leaveRequests.tanggalSelesai, tanggalMulai)
        )
      );

    if (overlapping.length > 0) {
      const match = overlapping[0];
      const statusLabel = match.statusApproval === "approved" ? "disetujui" : "menunggu persetujuan (pending)";
      return {
        error: `Anda sudah memiliki pengajuan ${match.jenis} pada tanggal ${match.tanggalMulai} s.d. ${match.tanggalSelesai} yang ${statusLabel}.`,
      };
    }

    // 3. Check if user already checked in on any of these dates
    const existingCheckIn = await db
      .select({ tanggal: attendance.tanggal })
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          gte(attendance.tanggal, tanggalMulai),
          lte(attendance.tanggal, tanggalSelesai),
          isNotNull(attendance.jamMasuk)
        )
      )
      .limit(1);

    if (existingCheckIn.length > 0) {
      return {
        error: `Anda sudah melakukan presensi masuk pada tanggal ${existingCheckIn[0].tanggal}, sehingga tidak dapat mengajukan izin/sakit pada tanggal tersebut.`,
      };
    }

    let fileSuratUrl: string | undefined = undefined;

    if (file && file.size > 0) {
      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return { error: "Ukuran file maksimal 5MB." };
      }

      // Validate file type
      const ALLOWED_TYPES = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          error: "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WebP.",
        };
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = file.type;
      const dataUrl = `data:${mimeType};base64,${base64}`;
      fileSuratUrl = await uploadImageToR2(dataUrl, "surat_izin");
    }

    await db.insert(leaveRequests).values({
      userId,
      jenis,
      tanggalMulai,
      tanggalSelesai,
      keterangan,
      fileSuratUrl,
      statusApproval: "pending",
    });

    revalidatePath("/intern/izin");
    revalidatePath("/intern");

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
