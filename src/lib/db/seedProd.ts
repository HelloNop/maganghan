import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { db } from "./index";
import { users, appSettings } from "./schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const isFresh = process.argv.includes("--fresh");

  console.log("🌱 Starting Production Seed...");

  if (isFresh) {
    console.log("🧹 Clearing all existing database tables (Fresh Reset)...");
    try {
      await db.execute(
        sql`TRUNCATE TABLE push_subscriptions, leave_requests, attendance, users, app_settings, positions, work_units RESTART IDENTITY CASCADE;`
      );
      console.log("✨ All tables cleaned & reset successfully!");
    } catch (err) {
      console.warn("⚠️ Truncate warning (some tables may not exist yet):", err);
    }
  }

  // 1. Seed Default App Settings (if not existing)
  console.log("Configuring default app settings...");
  await db
    .insert(appSettings)
    .values([
      {
        key: "office_lat",
        value: "",
        description: "Latitude lokasi kantor utama",
      },
      {
        key: "office_lng",
        value: "",
        description: "Longitude lokasi kantor utama",
      },
      {
        key: "office_radius_m",
        value: "100",
        description: "Radius toleransi lokasi GPS (meter)",
      },
      {
        key: "jam_buka_absen",
        value: "06:00",
        description: "Jam paling awal absen masuk dibuka (sebelum ini ditolak)",
      },
      {
        key: "jam_masuk",
        value: "08:00",
        description: "Jam batas masuk (setelah ini dianggap terlambat)",
      },
      {
        key: "jam_keluar",
        value: "17:00",
        description: "Jam minimal absen keluar",
      },
      {
        key: "nama_instansi",
        value: "Sistem Absensi Magang",
        description: "Nama instansi yang ditampilkan di aplikasi",
      },
    ])
    .onConflictDoNothing();

  // 2. Seed Single Production Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@maganghan.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminMagang123!";

  console.log(`Creating Production Super Admin account (${adminEmail})...`);

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      nama: "Administrator Utama",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
      mustChangePassword: true, // Force admin to change password on first login
      statusAktif: true,
    });
    console.log("✅ Production Admin account created successfully!");
    console.log("------------------------------------------------");
    console.log(`📧 Email    : ${adminEmail}`);
    console.log(`🔑 Password : ${adminPassword}`);
    console.log("⚠️  Note     : Admin wajib mengubah password saat pertama kali login.");
    console.log("------------------------------------------------");
  } else {
    console.log(`ℹ️ Admin account (${adminEmail}) already exists in database.`);
  }

  console.log("🎉 Production Seed Completed!");
}

main().catch((err) => {
  console.error("❌ Production Seeding failed:", err);
  process.exit(1);
});
