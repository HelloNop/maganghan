"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

export interface AdminListItem {
  id: string;
  nama: string;
  email: string;
  statusAktif: boolean;
  createdAt: Date;
}

const createAdminSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function getAdminUsersAction(): Promise<AdminListItem[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return [];

  try {
    const records = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        statusAktif: users.statusAktif,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "admin"))
      .orderBy(users.nama);

    return records;
  } catch (error) {
    console.error("Get admin users error:", error);
    return [];
  }
}

export async function createAdminUserAction(data: {
  nama: string;
  email: string;
  password: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = createAdminSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return { error: "Email sudah terdaftar." };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await db.insert(users).values({
      nama: data.nama.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: "admin",
      mustChangePassword: false,
      statusAktif: true,
    });

    revalidatePath("/admin/kelola-admin");
    return { success: true };
  } catch (error) {
    console.error("Create admin user error:", error);
    return { error: "Gagal menambahkan akun admin baru." };
  }
}

export async function toggleAdminStatusAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (session.user.id === targetUserId) {
    return { error: "Anda tidak dapat menonaktifkan akun sendiri." };
  }

  try {
    const userRecords = await db
      .select({ statusAktif: users.statusAktif })
      .from(users)
      .where(and(eq(users.id, targetUserId), eq(users.role, "admin")))
      .limit(1);

    if (userRecords.length === 0) return { error: "Pengguna admin tidak ditemukan." };

    const newStatus = !userRecords[0].statusAktif;
    await db
      .update(users)
      .set({ statusAktif: newStatus })
      .where(eq(users.id, targetUserId));

    revalidatePath("/admin/kelola-admin");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Toggle admin status error:", error);
    return { error: "Gagal mengubah status akun admin." };
  }
}

export async function resetAdminUserPasswordAction(
  targetUserId: string,
  newPassword: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ passwordHash })
      .where(and(eq(users.id, targetUserId), eq(users.role, "admin")));

    revalidatePath("/admin/kelola-admin");
    return { success: true };
  } catch (error) {
    console.error("Reset admin user password error:", error);
    return { error: "Gagal mereset password admin." };
  }
}
