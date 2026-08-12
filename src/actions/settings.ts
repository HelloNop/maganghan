"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface AppSettingsForm {
  namaInstansi: string;
  jamBukaAbsen: string;
  jamMasuk: string;
  jamKeluar: string;
  officeLat: string;
  officeLng: string;
  officeRadiusM: string;
}

export async function getAppSettingsForAdminAction(): Promise<AppSettingsForm> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return {
      namaInstansi: "Maganghan",
      jamBukaAbsen: "06:00",
      jamMasuk: "08:00",
      jamKeluar: "17:00",
      officeLat: "",
      officeLng: "",
      officeRadiusM: "100",
    };
  }

  try {
    const rows = await db.select().from(appSettings);
    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      settingsMap[row.key] = row.value;
    }

    return {
      namaInstansi: settingsMap["nama_instansi"] || "Maganghan",
      jamBukaAbsen: settingsMap["jam_buka_absen"] || "06:00",
      jamMasuk: settingsMap["jam_masuk"] || "08:00",
      jamKeluar: settingsMap["jam_keluar"] || "17:00",
      officeLat: settingsMap["office_lat"] || "",
      officeLng: settingsMap["office_lng"] || "",
      officeRadiusM: settingsMap["office_radius_m"] || "100",
    };
  } catch (error) {
    console.error("Get app settings admin error:", error);
    return {
      namaInstansi: "Maganghan",
      jamBukaAbsen: "06:00",
      jamMasuk: "08:00",
      jamKeluar: "17:00",
      officeLat: "",
      officeLng: "",
      officeRadiusM: "100",
    };
  }
}

export async function updateAppSettingsAction(data: AppSettingsForm) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const settingsToUpdate = [
      { key: "nama_instansi", value: data.namaInstansi.trim(), description: "Nama instansi yang tampil di aplikasi" },
      { key: "jam_buka_absen", value: data.jamBukaAbsen.trim(), description: "Jam paling awal absen masuk dibuka (HH:mm)" },
      { key: "jam_masuk", value: data.jamMasuk.trim(), description: "Jam batas tepat waktu (HH:mm)" },
      { key: "jam_keluar", value: data.jamKeluar.trim(), description: "Jam minimal absen keluar (HH:mm)" },
      { key: "office_lat", value: data.officeLat.trim(), description: "Latitude lokasi kantor" },
      { key: "office_lng", value: data.officeLng.trim(), description: "Longitude lokasi kantor" },
      { key: "office_radius_m", value: data.officeRadiusM.trim(), description: "Radius validasi GPS (meter)" },
    ];

    for (const item of settingsToUpdate) {
      await db
        .insert(appSettings)
        .values({
          key: item.key,
          value: item.value,
          description: item.description,
        })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: {
            value: item.value,
            updatedAt: new Date(),
          },
        });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pengaturan");
    revalidatePath("/intern");

    return { success: true };
  } catch (error) {
    console.error("Update app settings error:", error);
    return { error: "Gagal menyimpan pengaturan aplikasi." };
  }
}
