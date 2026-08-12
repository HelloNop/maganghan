"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leaveRequests, users, attendance } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface LeaveRequestForAdmin {
  id: string;
  userName: string;
  userEmail: string;
  jenis: "izin" | "sakit";
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string;
  fileSuratUrl: string | null;
  statusApproval: "pending" | "approved" | "rejected";
  approvedBy: string | null;
  createdAt: Date;
}

export async function getLeaveRequestsForAdminAction(
  status?: string
): Promise<LeaveRequestForAdmin[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const conditions = [];
    if (status && status !== "all") {
      conditions.push(
        eq(
          leaveRequests.statusApproval,
          status as "pending" | "approved" | "rejected"
        )
      );
    }

    const results = await db
      .select({
        id: leaveRequests.id,
        userName: users.nama,
        userEmail: users.email,
        jenis: leaveRequests.jenis,
        tanggalMulai: leaveRequests.tanggalMulai,
        tanggalSelesai: leaveRequests.tanggalSelesai,
        keterangan: leaveRequests.keterangan,
        fileSuratUrl: leaveRequests.fileSuratUrl,
        statusApproval: leaveRequests.statusApproval,
        approvedBy: leaveRequests.approvedBy,
        createdAt: leaveRequests.createdAt,
      })
      .from(leaveRequests)
      .innerJoin(users, eq(leaveRequests.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`${leaveRequests.createdAt} DESC`);

    return results;
  } catch (error) {
    console.error("Get leave requests admin error:", error);
    return [];
  }
}

export async function approveLeaveRequestAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    // Get the leave request details
    const request = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, id))
      .limit(1);

    if (request.length === 0) {
      return { error: "Pengajuan tidak ditemukan." };
    }

    if (request[0].statusApproval !== "pending") {
      return { error: "Pengajuan sudah diproses." };
    }

    // Update leave request status
    await db
      .update(leaveRequests)
      .set({
        statusApproval: "approved",
        approvedBy: session.user.id,
      })
      .where(eq(leaveRequests.id, id));

    // Create attendance records for the leave period
    const startDate = new Date(request[0].tanggalMulai);
    const endDate = new Date(request[0].tanggalSelesai);
    const status = request[0].jenis === "izin" ? "izin" : "sakit";

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      // Check if attendance record already exists
      const existing = await db
        .select({ id: attendance.id })
        .from(attendance)
        .where(
          and(
            eq(attendance.userId, request[0].userId),
            eq(attendance.tanggal, dateStr)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(attendance).values({
          userId: request[0].userId,
          tanggal: dateStr,
          status,
        });
      } else {
        await db
          .update(attendance)
          .set({ status })
          .where(eq(attendance.id, existing[0].id));
      }
    }

    revalidatePath("/admin/approval");
    revalidatePath("/admin");
    revalidatePath("/intern");
    revalidatePath("/intern/absen");
    revalidatePath("/intern/riwayat");
    return { success: true };
  } catch (error) {
    console.error("Approve leave request error:", error);
    return { error: "Gagal menyetujui pengajuan." };
  }
}

export async function rejectLeaveRequestAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const request = await db
      .select({ statusApproval: leaveRequests.statusApproval })
      .from(leaveRequests)
      .where(eq(leaveRequests.id, id))
      .limit(1);

    if (request.length === 0) {
      return { error: "Pengajuan tidak ditemukan." };
    }

    if (request[0].statusApproval !== "pending") {
      return { error: "Pengajuan sudah diproses." };
    }

    await db
      .update(leaveRequests)
      .set({
        statusApproval: "rejected",
        approvedBy: session.user.id,
      })
      .where(eq(leaveRequests.id, id));

    revalidatePath("/admin/approval");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Reject leave request error:", error);
    return { error: "Gagal menolak pengajuan." };
  }
}
