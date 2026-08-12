"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, workUnits, positions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginSchema, changePasswordSchema } from "@/lib/validators/auth";
import { checkLoginRateLimit, recordLoginFailure, clearLoginAttempts } from "@/lib/utils/rateLimit";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      error: validated.error.errors[0]?.message || "Input tidak valid",
    };
  }

  // Rate limit check
  const rateLimit = checkLoginRateLimit(email);
  if (!rateLimit.allowed) {
    return {
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    clearLoginAttempts(email);
    return { success: true };
  } catch (error) {
    recordLoginFailure(email);
    return {
      error: "Email atau password salah",
    };
  }
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validated = changePasswordSchema.safeParse({
    oldPassword,
    newPassword,
    confirmPassword,
  });

  if (!validated.success) {
    return {
      error: validated.error.errors[0]?.message || "Input tidak valid",
    };
  }

  try {
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (userList.length === 0) {
      return { error: "Pengguna tidak ditemukan." };
    }

    const user = userList[0];
    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!passwordMatch) {
      return { error: "Password lama tidak sesuai." };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { error: "Gagal memperbarui password. Silakan coba lagi." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function getCurrentUserProfile() {
  const session = await auth();
  if (!session?.user) return null;

  try {
    const results = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        role: users.role,
        unitKerja: workUnits.nama,
        posisi: positions.nama,
        tanggalMulai: users.tanggalMulai,
        tanggalSelesai: users.tanggalSelesai,
      })
      .from(users)
      .leftJoin(workUnits, eq(users.unitKerjaId, workUnits.id))
      .leftJoin(positions, eq(users.posisiId, positions.id))
      .where(eq(users.id, session.user.id))
      .limit(1);

    return results[0] || null;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}
