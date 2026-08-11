import React from "react";
import { getPositionsAction } from "@/actions/masterData";
import { PosisiTable } from "@/components/features/admin/PosisiTable";

export default async function AdminPosisiPage() {
  const positions = await getPositionsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Master Data Posisi
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola nama jabatan/posisi pekerjaan anak magang.
        </p>
      </div>

      <PosisiTable initialData={positions} />
    </div>
  );
}
