"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, users, workUnits, positions } from "@/lib/db/schema";
import { eq, and, sql, gte, lte, count } from "drizzle-orm";

export interface RekapItem {
  userId: string;
  nama: string;
  email: string;
  unitKerja: string | null;
  posisi: string | null;
  hadir: number;
  telat: number;
  alpha: number;
  izin: number;
  sakit: number;
  totalHariKerja: number;
  persentaseKehadiran: number;
}

export async function getAttendanceRekapAction(
  bulan: number,
  tahun: number,
  unitKerjaId?: string
): Promise<RekapItem[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const startDate = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
    // Last day of month
    const lastDay = new Date(tahun, bulan, 0).getDate();
    const endDate = `${tahun}-${String(bulan).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const conditions = [eq(users.role, "intern")];
    if (unitKerjaId && unitKerjaId !== "all") {
      conditions.push(eq(users.unitKerjaId, unitKerjaId));
    }

    const allInterns = await db
      .select({
        userId: users.id,
        nama: users.nama,
        email: users.email,
        unitKerja: workUnits.nama,
        posisi: positions.nama,
      })
      .from(users)
      .leftJoin(workUnits, eq(users.unitKerjaId, workUnits.id))
      .leftJoin(positions, eq(users.posisiId, positions.id))
      .where(and(...conditions))
      .orderBy(users.nama);

    if (allInterns.length === 0) return [];

    const attendanceRecords = await db
      .select({
        userId: attendance.userId,
        status: attendance.status,
        count: count(),
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.tanggal, startDate),
          lte(attendance.tanggal, endDate)
        )
      )
      .groupBy(attendance.userId, attendance.status);

    const rekapMap = new Map<
      string,
      { hadir: number; telat: number; alpha: number; izin: number; sakit: number }
    >();

    for (const record of attendanceRecords) {
      if (!rekapMap.has(record.userId)) {
        rekapMap.set(record.userId, {
          hadir: 0,
          telat: 0,
          alpha: 0,
          izin: 0,
          sakit: 0,
        });
      }
      const item = rekapMap.get(record.userId)!;
      if (record.status === "hadir") item.hadir = record.count;
      if (record.status === "telat") item.telat = record.count;
      if (record.status === "alpha") item.alpha = record.count;
      if (record.status === "izin") item.izin = record.count;
      if (record.status === "sakit") item.sakit = record.count;
    }

    return allInterns.map((intern) => {
      const stats = rekapMap.get(intern.userId) || {
        hadir: 0,
        telat: 0,
        alpha: 0,
        izin: 0,
        sakit: 0,
      };

      const totalHadirDanTelat = stats.hadir + stats.telat;
      const totalHariAbsensiRecorded =
        totalHadirDanTelat + stats.alpha + stats.izin + stats.sakit;
      const totalHariKerja = totalHariAbsensiRecorded || 1; // avoid zero division

      const persentaseKehadiran = Math.round(
        (totalHadirDanTelat / totalHariKerja) * 100
      );

      return {
        ...intern,
        ...stats,
        totalHariKerja: totalHariAbsensiRecorded,
        persentaseKehadiran,
      };
    });
  } catch (error) {
    console.error("Get attendance rekap error:", error);
    return [];
  }
}
