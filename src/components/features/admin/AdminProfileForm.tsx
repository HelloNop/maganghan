"use client";

import React, { useState } from "react";
import {
  AdminProfileData,
  updateAdminProfileAction,
  changeAdminPasswordAction,
} from "@/actions/adminProfile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, KeyRound, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminProfileFormProps {
  initialProfile: AdminProfileData | null;
}

export function AdminProfileForm({ initialProfile }: AdminProfileFormProps) {
  const [nama, setNama] = useState(initialProfile?.nama || "");
  const [email, setEmail] = useState(initialProfile?.email || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsUpdatingProfile(true);

    const res = await updateAdminProfileAction({ nama, email });
    setIsUpdatingProfile(false);

    if (res.error) {
      setProfileMsg({ type: "error", text: res.error });
    } else {
      setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setIsChangingPassword(true);

    const res = await changeAdminPasswordAction({
      oldPassword,
      newPassword,
      confirmPassword,
    });
    setIsChangingPassword(false);

    if (res.error) {
      setPasswordMsg({ type: "error", text: res.error });
    } else {
      setPasswordMsg({ type: "success", text: "Password berhasil diubah!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info Card */}
      <Card variant="elevated" className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006761] to-[#00837b] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#006761]/20 shrink-0">
          {nama.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1a1c1c]">{nama}</h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#006761]/10 text-[#006761] rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrator
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{email}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Edit Profil */}
        <Card variant="default" className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <User className="w-5 h-5 text-[#006761]" />
            <h3 className="text-base font-bold text-[#1a1c1c]">Pengaturan Profil</h3>
          </div>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-rose-50 text-rose-800 border border-rose-100"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />

            <Input
              label="Alamat Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              isLoading={isUpdatingProfile}
              className="w-full mt-2"
            >
              Simpan Perubahan Profil
            </Button>
          </form>
        </Card>

        {/* Form Ganti Password */}
        <Card variant="default" className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <KeyRound className="w-5 h-5 text-[#006761]" />
            <h3 className="text-base font-bold text-[#1a1c1c]">Ganti Password</h3>
          </div>

          {passwordMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-rose-50 text-rose-800 border border-rose-100"
              }`}
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Password Lama"
              type="password"
              placeholder="Masukkan password saat ini"
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
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="outline"
              isLoading={isChangingPassword}
              className="w-full mt-2 hover:bg-[#006761]/5 hover:border-[#006761] hover:text-[#006761]"
            >
              Ubah Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
