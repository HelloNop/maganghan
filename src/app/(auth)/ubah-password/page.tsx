"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { changePasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { KeyRound, AlertCircle } from "lucide-react";

export default function UbahPasswordPage() {
  const router = useRouter();
  const { update } = useSession();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("oldPassword", oldPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const result = await changePasswordAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Update session JWT flag if available
      try {
        if (update) {
          await update({ mustChangePassword: false });
        }
      } catch (e) {
        console.warn("Session update warning:", e);
      }
      router.push("/intern");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f9f9]">
      <div className="w-full max-w-md bg-white rounded-[28px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#1a1c1c] tracking-tight">
            Wajib Ganti Password
          </h1>
          <p className="text-xs text-[#6d7a78] mt-1 leading-relaxed">
            Demi keamanan akun Anda, silakan perbarui password bawaan saat pertama kali login.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-xs font-medium text-[#ba1a1a] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Password Lama"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            label="Password Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ketik ulang password baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3.5 mt-2 text-base font-semibold"
          >
            Simpan Password Baru
          </Button>
        </form>
      </div>
    </div>
  );
}
