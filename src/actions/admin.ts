"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, attendance, leaveRequests } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DashboardStats {
  totalInterns: number;
  activeInterns: number;
  todayPresent: number;
  todayLate: number;
  todayAbsent: number;
  pendingApprovals: number;
}

export async function getDashboardStatsAction(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return {
      totalInterns: 0,
      activeInterns: 0,
      todayPresent: 0,
      todayLate: 0,
      todayAbsent: 0,
      pendingApprovals: 0,
    };
  }

  const todayStr = getTodayDateString();

  try {
    const [totalResult, activeResult, todayAttendance, pendingResult] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(users)
          .where(eq(users.role, "intern")),
        db
          .select({ count: count() })
          .from(users)
          .where(and(eq(users.role, "intern"), eq(users.statusAktif, true))),
        db
          .select({
            status: attendance.status,
            count: count(),
          })
          .from(attendance)
          .where(eq(attendance.tanggal, todayStr))
          .groupBy(attendance.status),
        db
          .select({ count: count() })
          .from(leaveRequests)
          .where(eq(leaveRequests.statusApproval, "pending")),
      ]);

    const totalInterns = totalResult[0]?.count || 0;
    const activeInterns = activeResult[0]?.count || 0;

    let todayPresent = 0;
    let todayLate = 0;
    for (const row of todayAttendance) {
      if (row.status === "hadir") todayPresent = row.count;
      if (row.status === "telat") todayLate = row.count;
    }

    const todayCheckedIn = todayPresent + todayLate;
    const todayAbsent = Math.max(0, activeInterns - todayCheckedIn);
    const pendingApprovals = pendingResult[0]?.count || 0;

    return {
      totalInterns,
      activeInterns,
      todayPresent,
      todayLate,
      todayAbsent,
      pendingApprovals,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalInterns: 0,
      activeInterns: 0,
      todayPresent: 0,
      todayLate: 0,
      todayAbsent: 0,
      pendingApprovals: 0,
    };
  }
}

export interface WeeklyAttendanceData {
  day: string;
  hadir: number;
  telat: number;
  alpha: number;
}

export async function getWeeklyAttendanceAction(): Promise<WeeklyAttendanceData[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const today = new Date();
    const weekData: WeeklyAttendanceData[] = [];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const records = await db
        .select({
          status: attendance.status,
          count: count(),
        })
        .from(attendance)
        .where(eq(attendance.tanggal, dateStr))
        .groupBy(attendance.status);

      let hadir = 0;
      let telat = 0;
      let alpha = 0;

      for (const row of records) {
        if (row.status === "hadir") hadir = row.count;
        if (row.status === "telat") telat = row.count;
        if (row.status === "alpha") alpha = row.count;
      }

      weekData.push({
        day: dayNames[date.getDay()],
        hadir,
        telat,
        alpha,
      });
    }

    return weekData;
  } catch (error) {
    console.error("Weekly attendance error:", error);
    return [];
  }
}

export interface PendingApprovalPreview {
  id: string;
  userName: string;
  jenis: "izin" | "sakit";
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string;
  createdAt: Date;
}

export async function getRecentPendingApprovalsAction(): Promise<
  PendingApprovalPreview[]
> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const results = await db
      .select({
        id: leaveRequests.id,
        userName: users.nama,
        jenis: leaveRequests.jenis,
        tanggalMulai: leaveRequests.tanggalMulai,
        tanggalSelesai: leaveRequests.tanggalSelesai,
        keterangan: leaveRequests.keterangan,
        createdAt: leaveRequests.createdAt,
      })
      .from(leaveRequests)
      .innerJoin(users, eq(leaveRequests.userId, users.id))
      .where(eq(leaveRequests.statusApproval, "pending"))
      .orderBy(sql`${leaveRequests.createdAt} DESC`)
      .limit(5);

    return results;
  } catch (error) {
    console.error("Recent pending approvals error:", error);
    return [];
  }
}
