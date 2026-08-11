import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { workUnits, positions, users, appSettings } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // 1. Seed Work Units
  const [divisiIT] = await db
    .insert(workUnits)
    .values([
      { nama: "Divisi Teknologi Informasi", kode: "IT" },
      { nama: "Sekretariat & Hubungan Masyarakat", kode: "SEK" },
      { nama: "Divisi SDM & Perencanaan", kode: "SDM" },
    ])
    .onConflictDoNothing()
    .returning();

  // 2. Seed Positions
  const [posFrontend] = await db
    .insert(positions)
    .values([
      { nama: "Frontend Developer Intern" },
      { nama: "Backend Developer Intern" },
      { nama: "UI/UX Designer Intern" },
      { nama: "Administrative Assistant Intern" },
    ])
    .onConflictDoNothing()
    .returning();

  // 3. Seed App Settings
  await db
    .insert(appSettings)
    .values([
      {
        key: "office_lat",
        value: "-6.2088",
        description: "Latitude kantor utama",
      },
      {
        key: "office_lng",
        value: "106.8456",
        description: "Longitude kantor utama",
      },
      {
        key: "office_radius_m",
        value: "100",
        description: "Radius toleransi lokasi GPS (meter)",
      },
      {
        key: "jam_masuk",
        value: "08:00",
        description: "Jam batas tepat waktu (HH:mm)",
      },
      {
        key: "jam_keluar",
        value: "17:00",
        description: "Jam minimal absen keluar (HH:mm)",
      },
      {
        key: "nama_instansi",
        value: "Green Attendance System",
        description: "Nama instansi yang ditampilkan di aplikasi",
      },
    ])
    .onConflictDoNothing();

  // 4. Seed Admin & Intern users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const internPasswordHash = await bcrypt.hash("intern123", 10);

  // Admin user
  await db
    .insert(users)
    .values({
      nama: "Administrator Utama",
      email: "admin@magang.local",
      passwordHash: adminPasswordHash,
      role: "admin",
      mustChangePassword: false,
      statusAktif: true,
    })
    .onConflictDoNothing();

  // Intern user 1 (Rachel Kim / Rachel)
  await db
    .insert(users)
    .values({
      nama: "Rachel Kim",
      email: "rachel@magang.local",
      passwordHash: internPasswordHash,
      role: "intern",
      unitKerjaId: divisiIT?.id,
      posisiId: posFrontend?.id,
      mustChangePassword: true, // test redirect change password on first login
      statusAktif: true,
    })
    .onConflictDoNothing();

  // Intern user 2 (Budi Santoso)
  await db
    .insert(users)
    .values({
      nama: "Budi Santoso",
      email: "budi@magang.local",
      passwordHash: internPasswordHash,
      role: "intern",
      unitKerjaId: divisiIT?.id,
      posisiId: posFrontend?.id,
      mustChangePassword: false,
      statusAktif: true,
    })
    .onConflictDoNothing();

  console.log("Seeding completed successfully!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
