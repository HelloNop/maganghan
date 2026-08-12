"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, attendance, leaveRequests, workUnits, positions } from "@/lib/db/schema";
import { eq, and, count, sql, gte, lte } from "drizzle-orm";

import { getWibDateString } from "@/lib/utils/date";

function getTodayDateString(): string {
  return getWibDateString();
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
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);

    const startDateStr = getWibDateString(startDate);
    const endDateStr = getWibDateString(today);

    const records = await db
      .select({
        tanggal: attendance.tanggal,
        status: attendance.status,
        count: count(),
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.tanggal, startDateStr),
          lte(attendance.tanggal, endDateStr)
        )
      )
      .groupBy(attendance.tanggal, attendance.status);

    const countMap = new Map<string, number>();
    for (const r of records) {
      countMap.set(`${r.tanggal}_${r.status}`, r.count);
    }

    const weekData: WeeklyAttendanceData[] = [];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getWibDateString(date);

      const hadir = countMap.get(`${dateStr}_hadir`) || 0;
      const telat = countMap.get(`${dateStr}_telat`) || 0;
      const alpha = countMap.get(`${dateStr}_alpha`) || 0;

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

export interface TodayAttendanceAuditItem {
  id: string;
  userId: string;
  nama: string;
  email: string;
  unitKerja: string | null;
  posisi: string | null;
  jamMasuk: Date | null;
  jamKeluar: Date | null;
  fotoMasukUrl: string | null;
  fotoKeluarUrl: string | null;
  lokasiMasuk: string | null;
  lokasiKeluar: string | null;
  status: "hadir" | "telat" | "alpha" | "izin" | "sakit";
}

export async function getTodayAttendanceAuditAction(
  filterStatus?: string
): Promise<TodayAttendanceAuditItem[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  const todayStr = getTodayDateString();

  try {
    const conditions = [eq(attendance.tanggal, todayStr)];

    if (filterStatus && filterStatus !== "all") {
      conditions.push(eq(attendance.status, filterStatus as any));
    }

    const results = await db
      .select({
        id: attendance.id,
        userId: attendance.userId,
        nama: users.nama,
        email: users.email,
        unitKerja: workUnits.nama,
        posisi: positions.nama,
        jamMasuk: attendance.jamMasuk,
        jamKeluar: attendance.jamKeluar,
        fotoMasukUrl: attendance.fotoMasukUrl,
        fotoKeluarUrl: attendance.fotoKeluarUrl,
        lokasiMasuk: attendance.lokasiMasuk,
        lokasiKeluar: attendance.lokasiKeluar,
        status: attendance.status,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.userId, users.id))
      .leftJoin(workUnits, eq(users.unitKerjaId, workUnits.id))
      .leftJoin(positions, eq(users.posisiId, positions.id))
      .where(and(...conditions))
      .orderBy(sql`${attendance.jamMasuk} DESC`);

    return results;
  } catch (error) {
    console.error("Get today attendance audit error:", error);
    return [];
  }
}

