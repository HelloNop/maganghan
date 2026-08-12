"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { changePasswordSchema } from "@/lib/validators/auth";

export interface AdminProfileData {
  id: string;
  nama: string;
  email: string;
  createdAt: Date;
}

export async function getAdminProfileAction(): Promise<AdminProfileData | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;

  try {
    const records = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (records.length === 0) return null;
    return records[0];
  } catch (error) {
    console.error("Get admin profile error:", error);
    return null;
  }
}

export async function updateAdminProfileAction(data: {
  nama: string;
  email: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (!data.nama.trim()) return { error: "Nama tidak boleh kosong." };
  if (!data.email.trim() || !data.email.includes("@")) return { error: "Email tidak valid." };

  try {
    // Check if email already used by another user
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== session.user.id) {
      return { error: "Email sudah digunakan pengguna lain." };
    }

    await db
      .update(users)
      .set({
        nama: data.nama.trim(),
        email: data.email.toLowerCase().trim(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/admin");
    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Update admin profile error:", error);
    return { error: "Gagal mengupdate profil admin." };
  }
}

export async function changeAdminPasswordAction(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const validation = changePasswordSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const userRecords = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (userRecords.length === 0) return { error: "Pengguna tidak ditemukan." };

    const isValidPassword = await bcrypt.compare(
      data.oldPassword,
      userRecords[0].passwordHash
    );

    if (!isValidPassword) {
      return { error: "Password lama salah." };
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Change admin password error:", error);
    return { error: "Gagal mengubah password." };
  }
}
