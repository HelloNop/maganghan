"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance } from "@/lib/db/schema";
import { getAppSetting } from "@/lib/db/settings";
import { calculateDistanceInMeters } from "@/lib/utils/geo";
import { uploadImageToCloudinary } from "@/lib/utils/cloudinary";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export async function submitCheckInAction(
  fotoDataUrl: string,
  userLat: number,
  userLng: number
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const userId = session.user.id;
  const todayStr = getTodayDateString();

  try {
    // 1. Check if user already checked in today
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(eq(attendance.userId, userId), eq(attendance.tanggal, todayStr))
      )
      .limit(1);

    if (existing.length > 0 && existing[0].jamMasuk) {
      return { error: "Anda sudah melakukan check-in hari ini." };
    }

    // 2. Fetch app settings from DB in parallel
    const [officeLatStr, officeLngStr, officeRadiusStr, jamMasukSettingRaw] =
      await Promise.all([
        getAppSetting("office_lat"),
        getAppSetting("office_lng"),
        getAppSetting("office_radius_m"),
        getAppSetting("jam_masuk"),
      ]);

    const jamMasukSetting = jamMasukSettingRaw || "08:00";
    const officeRadiusM = parseInt(officeRadiusStr || "100", 10);

    // 3. Validate GPS radius if office coordinates are set
    if (officeLatStr && officeLngStr && officeLatStr.trim() !== "" && officeLngStr.trim() !== "") {
      const officeLat = parseFloat(officeLatStr);
      const officeLng = parseFloat(officeLngStr);

      if (!isNaN(officeLat) && !isNaN(officeLng)) {
        const distanceMeters = calculateDistanceInMeters(
          userLat,
          userLng,
          officeLat,
          officeLng
        );

        if (distanceMeters > officeRadiusM) {
          return {
            error: `Lokasi Anda berada di luar radius kantor (${Math.round(
              distanceMeters
            )}m dari kantor). Jarak maksimal ${officeRadiusM}m.`,
          };
        }
      }
    }

    // 4. Upload photo to Cloudinary
    const fotoUrl = await uploadImageToCloudinary(fotoDataUrl, "checkin");

    // 5. Determine status (hadir vs telat)
    const now = new Date();
    const currentTimeStr = formatTimeString(now);
    const status = currentTimeStr > jamMasukSetting ? "telat" : "hadir";
    const lokasiStr = `${userLat.toFixed(6)},${userLng.toFixed(6)}`;

    // 6. Save or update attendance record
    if (existing.length > 0) {
      await db
        .update(attendance)
        .set({
          jamMasuk: now,
          fotoMasukUrl: fotoUrl,
          lokasiMasuk: lokasiStr,
          status,
        })
        .where(eq(attendance.id, existing[0].id));
    } else {
      await db.insert(attendance).values({
        userId,
        tanggal: todayStr,
        jamMasuk: now,
        fotoMasukUrl: fotoUrl,
        lokasiMasuk: lokasiStr,
        status,
      });
    }

    revalidatePath("/intern");
    revalidatePath("/intern/riwayat");

    return {
      success: true,
      status,
      jamMasuk: currentTimeStr,
    };
  } catch (error) {
    console.error("Check-in error:", error);
    return { error: "Terjadi kesalahan saat submit absensi." };
  }
}

export async function submitCheckOutAction(
  fotoDataUrl: string,
  userLat: number,
  userLng: number
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const userId = session.user.id;
  const todayStr = getTodayDateString();

  try {
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(eq(attendance.userId, userId), eq(attendance.tanggal, todayStr))
      )
      .limit(1);

    if (existing.length === 0 || !existing[0].jamMasuk) {
      return { error: "Anda belum melakukan check-in hari ini." };
    }

    if (existing[0].jamKeluar) {
      return { error: "Anda sudah melakukan check-out hari ini." };
    }

    // Fetch office GPS settings
    const [officeLatStr, officeLngStr, officeRadiusStr] = await Promise.all([
      getAppSetting("office_lat"),
      getAppSetting("office_lng"),
      getAppSetting("office_radius_m"),
    ]);

    const officeRadiusM = parseInt(officeRadiusStr || "100", 10);

    if (officeLatStr && officeLngStr && officeLatStr.trim() !== "" && officeLngStr.trim() !== "") {
      const officeLat = parseFloat(officeLatStr);
      const officeLng = parseFloat(officeLngStr);

      if (!isNaN(officeLat) && !isNaN(officeLng)) {
        const distanceMeters = calculateDistanceInMeters(
          userLat,
          userLng,
          officeLat,
          officeLng
        );

        if (distanceMeters > officeRadiusM) {
          return {
            error: `Lokasi Anda berada di luar radius kantor (${Math.round(
              distanceMeters
            )}m dari kantor). Jarak maksimal ${officeRadiusM}m.`,
          };
        }
      }
    }

    const fotoUrl = await uploadImageToCloudinary(fotoDataUrl, "checkout");
    const now = new Date();
    const lokasiStr = `${userLat.toFixed(6)},${userLng.toFixed(6)}`;

    await db
      .update(attendance)
      .set({
        jamKeluar: now,
        fotoKeluarUrl: fotoUrl,
        lokasiKeluar: lokasiStr,
      })
      .where(eq(attendance.id, existing[0].id));

    revalidatePath("/intern");
    revalidatePath("/intern/riwayat");

    return {
      success: true,
      jamKeluar: formatTimeString(now),
    };
  } catch (error) {
    console.error("Check-out error:", error);
    return { error: "Terjadi kesalahan saat submit check-out." };
  }
}

export async function getTodayAttendanceAction() {
  const session = await auth();
  if (!session?.user) return null;

  const todayStr = getTodayDateString();

  try {
    const record = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, session.user.id),
          eq(attendance.tanggal, todayStr)
        )
      )
      .limit(1);

    return record[0] || null;
  } catch (error) {
    console.error("Fetch today attendance error:", error);
    return null;
  }
}

export async function getOfficeLocationAction() {
  try {
    const [officeLatStr, officeLngStr, officeRadiusStr] = await Promise.all([
      getAppSetting("office_lat"),
      getAppSetting("office_lng"),
      getAppSetting("office_radius_m"),
    ]);

    if (!officeLatStr || !officeLngStr) return null;

    const lat = parseFloat(officeLatStr);
    const lng = parseFloat(officeLngStr);
    const radius = parseInt(officeRadiusStr || "100", 10);

    if (isNaN(lat) || isNaN(lng)) return null;

    return { lat, lng, radius };
  } catch (error) {
    console.error("Fetch office location error:", error);
    return null;
  }
}

export async function getAppNameAction() {
  const name = await getAppSetting("nama_instansi");
  return name || "Maganghan";
}
