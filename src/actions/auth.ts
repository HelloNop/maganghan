"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginSchema, changePasswordSchema } from "@/lib/validators/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      error: validated.error.errors[0]?.message || "Input tidak valid",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
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
