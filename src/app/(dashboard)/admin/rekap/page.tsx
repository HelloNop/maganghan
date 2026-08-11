import React from "react";
import { getAttendanceRekapAction } from "@/actions/rekap";
import { getWorkUnitsAction } from "@/actions/masterData";
import { RekapTable } from "@/components/features/admin/RekapTable";

export default async function AdminRekapPage() {
  const now = new Date();
  const currentBulan = now.getMonth() + 1;
  const currentTahun = now.getFullYear();

  const [rekapData, workUnits] = await Promise.all([
    getAttendanceRekapAction(currentBulan, currentTahun),
    getWorkUnitsAction(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Rekapitulasi Kehadiran
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Rekap bulanan persentase dan statistik kehadiran anak magang beserta fitur export Excel.
        </p>
      </div>

      <RekapTable
        initialData={rekapData}
        workUnits={workUnits}
        currentBulan={currentBulan}
        currentTahun={currentTahun}
      />
    </div>
  );
}
