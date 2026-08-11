import React from "react";
import { getAppSettingsForAdminAction } from "@/actions/settings";
import { SettingsForm } from "@/components/features/admin/SettingsForm";

export default async function AdminPengaturanPage() {
  const settings = await getAppSettingsForAdminAction();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Pengaturan Sistem
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Atur jam kerja, radius lokasi GPS kantor, dan identitas instansi.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
