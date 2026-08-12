"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, workUnits, positions } from "@/lib/db/schema";
import { internSchema } from "@/lib/validators/intern";
import { eq, and, ilike, count, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "magang123";

export interface InternListItem {
  id: string;
  nama: string;
  email: string;
  unitKerja: string | null;
  posisi: string | null;
  unitKerjaId: string | null;
  posisiId: string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  statusAktif: boolean;
  mustChangePassword: boolean;
}

export async function getInternsAction(
  search?: string,
  unitKerjaId?: string,
  statusAktif?: string
): Promise<InternListItem[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const conditions = [eq(users.role, "intern")];

    if (statusAktif === "active") {
      conditions.push(eq(users.statusAktif, true));
    } else if (statusAktif === "inactive") {
      conditions.push(eq(users.statusAktif, false));
    }

    if (unitKerjaId && unitKerjaId !== "all") {
      conditions.push(eq(users.unitKerjaId, unitKerjaId));
    }

    let query = db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        unitKerja: workUnits.nama,
        posisi: positions.nama,
        unitKerjaId: users.unitKerjaId,
        posisiId: users.posisiId,
        tanggalMulai: users.tanggalMulai,
        tanggalSelesai: users.tanggalSelesai,
        statusAktif: users.statusAktif,
        mustChangePassword: users.mustChangePassword,
      })
      .from(users)
      .leftJoin(workUnits, eq(users.unitKerjaId, workUnits.id))
      .leftJoin(positions, eq(users.posisiId, positions.id))
      .where(and(...conditions))
      .orderBy(users.nama)
      .$dynamic();

    const results = await query;

    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      return results.filter(
        (r) =>
          r.nama.toLowerCase().includes(searchLower) ||
          r.email.toLowerCase().includes(searchLower)
      );
    }

    return results;
  } catch (error) {
    console.error("Get interns error:", error);
    return [];
  }
}

export async function createInternAction(data: {
  nama: string;
  email: string;
  unitKerjaId?: string;
  posisiId?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = internSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    // Check if email already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return { error: "Email sudah terdaftar." };
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await db.insert(users).values({
      nama: data.nama.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: "intern",
      unitKerjaId: data.unitKerjaId || null,
      posisiId: data.posisiId || null,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai,
      mustChangePassword: true,
      statusAktif: true,
    });

    revalidatePath("/admin/anak-magang");
    return { success: true };
  } catch (error) {
    console.error("Create intern error:", error);
    return { error: "Gagal menambahkan anak magang." };
  }
}

export async function updateInternAction(
  id: string,
  data: {
    nama: string;
    email: string;
    unitKerjaId?: string;
    posisiId?: string;
    tanggalMulai: string;
    tanggalSelesai: string;
  }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = internSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    // Check if email is taken by another user
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== id) {
      return { error: "Email sudah digunakan pengguna lain." };
    }

    await db
      .update(users)
      .set({
        nama: data.nama.trim(),
        email: data.email.toLowerCase().trim(),
        unitKerjaId: data.unitKerjaId || null,
        posisiId: data.posisiId || null,
        tanggalMulai: data.tanggalMulai,
        tanggalSelesai: data.tanggalSelesai,
      })
      .where(eq(users.id, id));

    revalidatePath("/admin/anak-magang");
    return { success: true };
  } catch (error) {
    console.error("Update intern error:", error);
    return { error: "Gagal mengupdate data anak magang." };
  }
}

export async function toggleInternStatusAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const user = await db
      .select({ statusAktif: users.statusAktif })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      return { error: "Pengguna tidak ditemukan." };
    }

    await db
      .update(users)
      .set({ statusAktif: !user[0].statusAktif })
      .where(eq(users.id, id));

    revalidatePath("/admin/anak-magang");
    return { success: true, newStatus: !user[0].statusAktif };
  } catch (error) {
    console.error("Toggle intern status error:", error);
    return { error: "Gagal mengubah status." };
  }
}

export async function resetInternPasswordAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await db
      .update(users)
      .set({
        passwordHash,
        mustChangePassword: true,
      })
      .where(eq(users.id, id));

    revalidatePath("/admin/anak-magang");
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Gagal mereset password." };
  }
}

export async function bulkImportInternsAction(
  rows: {
    nama: string;
    email: string;
    unit_kerja?: string;
    posisi?: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
  }[]
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const errors: { row: number; message: string }[] = [];
  let successCount = 0;

  try {
    // Prefetch work units and positions for matching
    const allWorkUnits = await db.select().from(workUnits);
    const allPositions = await db.select().from(positions);

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.nama || !row.email || !row.tanggal_mulai || !row.tanggal_selesai) {
        errors.push({
          row: i + 1,
          message: "Kolom nama, email, tanggal_mulai, dan tanggal_selesai wajib diisi.",
        });
        continue;
      }

      // Check email uniqueness
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, row.email.toLowerCase().trim()))
        .limit(1);

      if (existing.length > 0) {
        errors.push({
          row: i + 1,
          message: `Email ${row.email} sudah terdaftar.`,
        });
        continue;
      }

      // Match unit kerja by code OR name (case-insensitive)
      let unitKerjaId: string | null = null;
      if (row.unit_kerja) {
        const val = row.unit_kerja.toLowerCase().trim();
        const match = allWorkUnits.find(
          (u) => (u.kode && u.kode.toLowerCase() === val) || u.nama.toLowerCase() === val
        );
        if (match) {
          unitKerjaId = match.id;
        }
      }

      // Match posisi by name (case-insensitive)
      let posisiId: string | null = null;
      if (row.posisi) {
        const val = row.posisi.toLowerCase().trim();
        const match = allPositions.find(
          (p) => p.nama.toLowerCase() === val
        );
        if (match) {
          posisiId = match.id;
        }
      }

      try {
        await db.insert(users).values({
          nama: row.nama.trim(),
          email: row.email.toLowerCase().trim(),
          passwordHash,
          role: "intern",
          unitKerjaId,
          posisiId,
          tanggalMulai: row.tanggal_mulai,
          tanggalSelesai: row.tanggal_selesai,
          mustChangePassword: true,
          statusAktif: true,
        });
        successCount++;
      } catch (err) {
        errors.push({
          row: i + 1,
          message: `Gagal menyimpan: ${String(err).slice(0, 100)}`,
        });
      }
    }

    revalidatePath("/admin/anak-magang");

    return {
      success: true,
      successCount,
      errorCount: errors.length,
      errors: errors.slice(0, 20), // Limit error reporting
    };
  } catch (error) {
    console.error("Bulk import error:", error);
    return { error: "Gagal melakukan import." };
  }
}
