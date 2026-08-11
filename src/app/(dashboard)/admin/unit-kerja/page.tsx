import React from "react";
import { getWorkUnitsAction } from "@/actions/masterData";
import { UnitKerjaTable } from "@/components/features/admin/UnitKerjaTable";

export default async function AdminUnitKerjaPage() {
  const workUnits = await getWorkUnitsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Master Data Unit Kerja
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola divisi atau unit kerja tempat anak magang ditempatkan.
        </p>
      </div>

      <UnitKerjaTable initialData={workUnits} />
    </div>
  );
}
