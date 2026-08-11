import React from "react";
import { getInternsAction } from "@/actions/intern";
import { getWorkUnitsAction, getPositionsAction } from "@/actions/masterData";
import { InternTable } from "@/components/features/admin/InternTable";

export default async function AdminAnakMagangPage() {
  const [interns, workUnits, positions] = await Promise.all([
    getInternsAction(),
    getWorkUnitsAction(),
    getPositionsAction(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Manajemen Data Anak Magang
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola akun, penempatan unit kerja, periode magang, dan import data massal.
        </p>
      </div>

      <InternTable
        initialData={interns}
        workUnits={workUnits}
        positions={positions}
      />
    </div>
  );
}
