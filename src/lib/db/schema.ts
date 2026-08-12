import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "intern"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "hadir",
  "telat",
  "alpha",
  "izin",
  "sakit",
]);
export const leaveTypeEnum = pgEnum("leave_type", ["izin", "sakit"]);
export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
]);

// Master Work Units
export const workUnits = pgTable("work_units", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: text("nama").notNull().unique(),
  kode: text("kode").unique(),
});

// Master Positions
export const positions = pgTable("positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: text("nama").notNull().unique(),
});

// Users
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nama: text("nama").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("intern").notNull(),
    unitKerjaId: uuid("unit_kerja_id").references(() => workUnits.id, {
      onDelete: "set null",
    }),
    posisiId: uuid("posisi_id").references(() => positions.id, {
      onDelete: "set null",
    }),
    tanggalMulai: date("tanggal_mulai"),
    tanggalSelesai: date("tanggal_selesai"),
    mustChangePassword: boolean("must_change_password").default(true).notNull(),
    statusAktif: boolean("status_aktif").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_unit_kerja_idx").on(table.unitKerjaId),
    index("users_posisi_idx").on(table.posisiId),
  ]
);

// Attendance Records
export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tanggal: date("tanggal").notNull(),
    jamMasuk: timestamp("jam_masuk"),
    jamKeluar: timestamp("jam_keluar"),
    fotoMasukUrl: text("foto_masuk_url"),
    fotoKeluarUrl: text("foto_keluar_url"),
    lokasiMasuk: text("lokasi_masuk"),
    lokasiKeluar: text("lokasi_keluar"),
    status: attendanceStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("attendance_user_idx").on(table.userId),
    index("attendance_user_tanggal_idx").on(table.userId, table.tanggal),
  ]
);

// Leave Requests (Pengajuan Izin / Sakit)
export const leaveRequests = pgTable(
  "leave_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tanggalMulai: date("tanggal_mulai").notNull(),
    tanggalSelesai: date("tanggal_selesai").notNull(),
    jenis: leaveTypeEnum("jenis").notNull(),
    keterangan: text("keterangan").notNull(),
    fileSuratUrl: text("file_surat_url"),
    statusApproval: leaveStatusEnum("status_approval")
      .default("pending")
      .notNull(),
    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("leave_requests_user_idx").on(table.userId),
    index("leave_requests_approved_by_idx").on(table.approvedBy),
  ]
);

// App Settings (Office Hours, GPS Coordinates, Radius, Instance Name, etc.)
export const appSettings = pgTable("app_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Push Notifications Subscriptions
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("push_subscriptions_user_idx").on(table.userId)]
);

