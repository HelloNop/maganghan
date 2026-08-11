"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workUnits, positions, users } from "@/lib/db/schema";
import { workUnitSchema, positionSchema } from "@/lib/validators/masterData";
import { eq, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================== WORK UNITS ====================

export interface WorkUnitWithCount {
  id: string;
  nama: string;
  kode: string | null;
  internCount: number;
}

export async function getWorkUnitsAction(): Promise<WorkUnitWithCount[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const results = await db
      .select({
        id: workUnits.id,
        nama: workUnits.nama,
        kode: workUnits.kode,
        internCount: count(users.id),
      })
      .from(workUnits)
      .leftJoin(users, eq(users.unitKerjaId, workUnits.id))
      .groupBy(workUnits.id, workUnits.nama, workUnits.kode)
      .orderBy(workUnits.nama);

    return results;
  } catch (error) {
    console.error("Get work units error:", error);
    return [];
  }
}

export async function createWorkUnitAction(nama: string, kode?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = workUnitSchema.safeParse({ nama, kode });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    await db.insert(workUnits).values({
      nama: validation.data.nama,
      kode: validation.data.kode || null,
    });

    revalidatePath("/admin/unit-kerja");
    return { success: true };
  } catch (error) {
    console.error("Create work unit error:", error);
    if (String(error).includes("unique")) {
      return { error: "Kode unit kerja sudah digunakan." };
    }
    return { error: "Gagal menambahkan unit kerja." };
  }
}

export async function updateWorkUnitAction(
  id: string,
  nama: string,
  kode?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = workUnitSchema.safeParse({ nama, kode });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    await db
      .update(workUnits)
      .set({
        nama: validation.data.nama,
        kode: validation.data.kode || null,
      })
      .where(eq(workUnits.id, id));

    revalidatePath("/admin/unit-kerja");
    return { success: true };
  } catch (error) {
    console.error("Update work unit error:", error);
    if (String(error).includes("unique")) {
      return { error: "Kode unit kerja sudah digunakan." };
    }
    return { error: "Gagal mengupdate unit kerja." };
  }
}

export async function deleteWorkUnitAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    // Check if there are interns using this work unit
    const internCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.unitKerjaId, id));

    if (internCount[0]?.count > 0) {
      return {
        error: `Tidak dapat menghapus. Masih ada ${internCount[0].count} anak magang di unit kerja ini.`,
      };
    }

    await db.delete(workUnits).where(eq(workUnits.id, id));

    revalidatePath("/admin/unit-kerja");
    return { success: true };
  } catch (error) {
    console.error("Delete work unit error:", error);
    return { error: "Gagal menghapus unit kerja." };
  }
}

// ==================== POSITIONS ====================

export interface PositionWithCount {
  id: string;
  nama: string;
  internCount: number;
}

export async function getPositionsAction(): Promise<PositionWithCount[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const results = await db
      .select({
        id: positions.id,
        nama: positions.nama,
        internCount: count(users.id),
      })
      .from(positions)
      .leftJoin(users, eq(users.posisiId, positions.id))
      .groupBy(positions.id, positions.nama)
      .orderBy(positions.nama);

    return results;
  } catch (error) {
    console.error("Get positions error:", error);
    return [];
  }
}

export async function createPositionAction(nama: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = positionSchema.safeParse({ nama });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    await db.insert(positions).values({
      nama: validation.data.nama,
    });

    revalidatePath("/admin/posisi");
    return { success: true };
  } catch (error) {
    console.error("Create position error:", error);
    return { error: "Gagal menambahkan posisi." };
  }
}

export async function updatePositionAction(id: string, nama: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = positionSchema.safeParse({ nama });
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    await db
      .update(positions)
      .set({ nama: validation.data.nama })
      .where(eq(positions.id, id));

    revalidatePath("/admin/posisi");
    return { success: true };
  } catch (error) {
    console.error("Update position error:", error);
    return { error: "Gagal mengupdate posisi." };
  }
}

export async function deletePositionAction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const internCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.posisiId, id));

    if (internCount[0]?.count > 0) {
      return {
        error: `Tidak dapat menghapus. Masih ada ${internCount[0].count} anak magang dengan posisi ini.`,
      };
    }

    await db.delete(positions).where(eq(positions.id, id));

    revalidatePath("/admin/posisi");
    return { success: true };
  } catch (error) {
    console.error("Delete position error:", error);
    return { error: "Gagal menghapus posisi." };
  }
}
