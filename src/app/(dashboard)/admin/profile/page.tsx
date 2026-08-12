import React from "react";
import { getAdminProfileAction } from "@/actions/adminProfile";
import { AdminProfileForm } from "@/components/features/admin/AdminProfileForm";

export default async function AdminProfilePage() {
  const profile = await getAdminProfileAction();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Profil Saya
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi akun administrator dan keamanan kata sandi.
        </p>
      </div>

      <AdminProfileForm initialProfile={profile} />
    </div>
  );
}
