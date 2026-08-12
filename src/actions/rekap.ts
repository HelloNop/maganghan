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

export interface DailyAttendanceDetail {
  tanggal: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string;
  isWeekend: boolean;
  attendance: {
    id: string;
    status: "hadir" | "telat" | "alpha" | "izin" | "sakit";
    jamMasuk: Date | null;
    jamKeluar: Date | null;
    fotoMasukUrl: string | null;
    fotoKeluarUrl: string | null;
    lokasiMasuk: string | null;
    lokasiKeluar: string | null;
  } | null;
}

export interface InternAttendanceDetailResult {
  intern: {
    id: string;
    nama: string;
    email: string;
    unitKerja: string | null;
    posisi: string | null;
    tanggalMulai: string | null;
    tanggalSelesai: string | null;
  };
  dailyRecords: DailyAttendanceDetail[];
  stats: {
    hadir: number;
    telat: number;
    alpha: number;
    izin: number;
    sakit: number;
    totalHadirDanTelat: number;
    persentaseKehadiran: number;
  };
}

export async function getInternAttendanceDetailAction(
  userId: string,
  bulan: number,
  tahun: number
): Promise<InternAttendanceDetailResult | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;

  try {
    // 1. Fetch user info
    const userRecords = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        unitKerja: workUnits.nama,
        posisi: positions.nama,
        tanggalMulai: users.tanggalMulai,
        tanggalSelesai: users.tanggalSelesai,
      })
      .from(users)
      .leftJoin(workUnits, eq(users.unitKerjaId, workUnits.id))
      .leftJoin(positions, eq(users.posisiId, positions.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (userRecords.length === 0) return null;
    const intern = userRecords[0];

    // 2. Fetch monthly attendance records
    const startDate = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
    const lastDayNum = new Date(tahun, bulan, 0).getDate();
    const endDate = `${tahun}-${String(bulan).padStart(2, "0")}-${String(lastDayNum).padStart(2, "0")}`;

    const records = await db
      .select({
        id: attendance.id,
        tanggal: attendance.tanggal,
        jamMasuk: attendance.jamMasuk,
        jamKeluar: attendance.jamKeluar,
        fotoMasukUrl: attendance.fotoMasukUrl,
        fotoKeluarUrl: attendance.fotoKeluarUrl,
        lokasiMasuk: attendance.lokasiMasuk,
        lokasiKeluar: attendance.lokasiKeluar,
        status: attendance.status,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          gte(attendance.tanggal, startDate),
          lte(attendance.tanggal, endDate)
        )
      );

    const recordMap = new Map<string, typeof records[0]>();
    for (const r of records) {
      recordMap.set(r.tanggal, r);
    }

    const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dailyRecords: DailyAttendanceDetail[] = [];

    let hadirCount = 0;
    let telatCount = 0;
    let alphaCount = 0;
    let izinCount = 0;
    let sakitCount = 0;

    for (let day = 1; day <= lastDayNum; day++) {
      const dateObj = new Date(tahun, bulan - 1, day);
      const dateStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayName = DAY_NAMES[dayOfWeek];

      const att = recordMap.get(dateStr) || null;

      if (att) {
        if (att.status === "hadir") hadirCount++;
        else if (att.status === "telat") telatCount++;
        else if (att.status === "alpha") alphaCount++;
        else if (att.status === "izin") izinCount++;
        else if (att.status === "sakit") sakitCount++;
      }

      dailyRecords.push({
        tanggal: dateStr,
        dayNumber: day,
        dayName,
        isWeekend,
        attendance: att
          ? {
              id: att.id,
              status: att.status,
              jamMasuk: att.jamMasuk,
              jamKeluar: att.jamKeluar,
              fotoMasukUrl: att.fotoMasukUrl,
              fotoKeluarUrl: att.fotoKeluarUrl,
              lokasiMasuk: att.lokasiMasuk,
              lokasiKeluar: att.lokasiKeluar,
            }
          : null,
      });
    }

    const totalHadirDanTelat = hadirCount + telatCount;
    const totalRecordedDays = totalHadirDanTelat + alphaCount + izinCount + sakitCount;
    const persentaseKehadiran = totalRecordedDays > 0
      ? Math.round((totalHadirDanTelat / totalRecordedDays) * 100)
      : 0;

    return {
      intern,
      dailyRecords,
      stats: {
        hadir: hadirCount,
        telat: telatCount,
        alpha: alphaCount,
        izin: izinCount,
        sakit: sakitCount,
        totalHadirDanTelat,
        persentaseKehadiran,
      },
    };
  } catch (error) {
    console.error("Get intern attendance detail error:", error);
    return null;
  }
}

export interface MatrixInternItem {
  userId: string;
  nama: string;
  email: string;
  unitKerja: string | null;
  posisi: string | null;
  dailyStatus: Record<
    number,
    {
      status: "hadir" | "telat" | "alpha" | "izin" | "sakit" | "libur" | "tanpa_data";
      jamMasukStr: string | null;
      isWeekend: boolean;
    }
  >;
  hadir: number;
  telat: number;
  izin: number;
  sakit: number;
  alpha: number;
  totalHariKerja: number;
  persentaseKehadiran: number;
}

export async function getFullAttendanceMatrixAction(
  bulan: number,
  tahun: number,
  unitKerjaId?: string
): Promise<{ items: MatrixInternItem[]; lastDay: number } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;

  try {
    const startDate = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
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

    if (allInterns.length === 0) return { items: [], lastDay };

    const records = await db
      .select({
        userId: attendance.userId,
        tanggal: attendance.tanggal,
        status: attendance.status,
        jamMasuk: attendance.jamMasuk,
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.tanggal, startDate),
          lte(attendance.tanggal, endDate)
        )
      );

    const userDateMap = new Map<string, typeof records[0]>();
    for (const r of records) {
      userDateMap.set(`${r.userId}_${r.tanggal}`, r);
    }

    const items: MatrixInternItem[] = allInterns.map((intern) => {
      const dailyStatus: MatrixInternItem["dailyStatus"] = {};
      let hadir = 0;
      let telat = 0;
      let izin = 0;
      let sakit = 0;
      let alpha = 0;

      for (let day = 1; day <= lastDay; day++) {
        const dateObj = new Date(tahun, bulan - 1, day);
        const dateStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const rec = userDateMap.get(`${intern.userId}_${dateStr}`);

        if (rec) {
          const jamMasukStr = rec.jamMasuk
            ? new Date(rec.jamMasuk).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          if (rec.status === "hadir") hadir++;
          else if (rec.status === "telat") telat++;
          else if (rec.status === "izin") izin++;
          else if (rec.status === "sakit") sakit++;
          else if (rec.status === "alpha") alpha++;

          dailyStatus[day] = {
            status: rec.status,
            jamMasukStr,
            isWeekend,
          };
        } else {
          dailyStatus[day] = {
            status: isWeekend ? "libur" : "tanpa_data",
            jamMasukStr: null,
            isWeekend,
          };
        }
      }

      const totalHadirDanTelat = hadir + telat;
      const totalRecorded = totalHadirDanTelat + izin + sakit + alpha;
      const persentaseKehadiran =
        totalRecorded > 0 ? Math.round((totalHadirDanTelat / totalRecorded) * 100) : 0;

      return {
        ...intern,
        dailyStatus,
        hadir,
        telat,
        izin,
        sakit,
        alpha,
        totalHariKerja: totalRecorded,
        persentaseKehadiran,
      };
    });

    return { items, lastDay };
  } catch (error) {
    console.error("Get full attendance matrix error:", error);
    return null;
  }
}


