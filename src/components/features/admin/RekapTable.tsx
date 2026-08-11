"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { RekapItem, getAttendanceRekapAction } from "@/actions/rekap";
import { WorkUnitWithCount } from "@/actions/masterData";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Search, Download, Calendar, Building2 } from "lucide-react";
import clsx from "clsx";

interface RekapTableProps {
  initialData: RekapItem[];
  workUnits: WorkUnitWithCount[];
  currentBulan: number;
  currentTahun: number;
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function RekapTable({
  initialData,
  workUnits,
  currentBulan,
  currentTahun,
}: RekapTableProps) {
  const [data, setData] = useState(initialData);
  const [bulan, setBulan] = useState(currentBulan);
  const [tahun, setTahun] = useState(currentTahun);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFilter = async () => {
    setIsLoading(true);
    const newRekap = await getAttendanceRekapAction(
      bulan,
      tahun,
      selectedUnitKerja
    );
    setData(newRekap);
    setIsLoading(false);
  };

  const handleExportExcel = () => {
    if (data.length === 0) return;

    const exportRows = filteredData.map((item, idx) => ({
      No: idx + 1,
      Nama: item.nama,
      Email: item.email,
      "Unit Kerja": item.unitKerja || "-",
      Posisi: item.posisi || "-",
      "Hadir (Tepat Waktu)": item.hadir,
      Terlambat: item.telat,
      Alpha: item.alpha,
      Izin: item.izin,
      Sakit: item.sakit,
      "Total Recorded Hari": item.totalHariKerja,
      "% Kehadiran": `${item.persentaseKehadiran}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Kehadiran");

    // Auto width column formatting
    const max_widths = exportRows.reduce((acc: Record<string, number>, row) => {
      Object.keys(row).forEach((key) => {
        const valStr = String((row as Record<string, unknown>)[key]);
        acc[key] = Math.max(acc[key] || key.length, valStr.length);
      });
      return acc;
    }, {});
    worksheet["!cols"] = Object.keys(max_widths).map((k) => ({
      wch: max_widths[k] + 3,
    }));

    const bulanName = BULAN_NAMES[bulan - 1];
    XLSX.writeFile(
      workbook,
      `Rekap_Absensi_Anak_Magang_${bulanName}_${tahun}.xlsx`
    );
  };

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
    return (
      item.nama.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      key: "nama",
      header: "Nama & Email",
      render: (row: RekapItem) => (
        <div>
          <p className="font-bold text-[#1a1c1c] text-sm">{row.nama}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      key: "unitKerja",
      header: "Unit Kerja & Posisi",
      render: (row: RekapItem) => (
        <div>
          <p className="font-semibold text-gray-800 text-sm">
            {row.unitKerja || "-"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{row.posisi || "-"}</p>
        </div>
      ),
    },
    {
      key: "hadir",
      header: "Hadir",
      render: (row: RekapItem) => (
        <span className="font-bold text-emerald-600">{row.hadir}</span>
      ),
    },
    {
      key: "telat",
      header: "Telat",
      render: (row: RekapItem) => (
        <span className="font-bold text-amber-600">{row.telat}</span>
      ),
    },
    {
      key: "izin",
      header: "Izin",
      render: (row: RekapItem) => (
        <span className="font-bold text-sky-600">{row.izin}</span>
      ),
    },
    {
      key: "sakit",
      header: "Sakit",
      render: (row: RekapItem) => (
        <span className="font-bold text-purple-600">{row.sakit}</span>
      ),
    },
    {
      key: "alpha",
      header: "Alpha",
      render: (row: RekapItem) => (
        <span className="font-bold text-rose-600">{row.alpha}</span>
      ),
    },
    {
      key: "persentaseKehadiran",
      header: "% Kehadiran",
      render: (row: RekapItem) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                row.persentaseKehadiran >= 80
                  ? "bg-emerald-500"
                  : row.persentaseKehadiran >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
              style={{ width: `${row.persentaseKehadiran}%` }}
            />
          </div>
          <span className="font-bold text-xs text-gray-700">
            {row.persentaseKehadiran}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-end gap-4 justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">
              Bulan
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#f5f5f5] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
            >
              {BULAN_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">
              Tahun
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#f5f5f5] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">
              Unit Kerja
            </label>
            <select
              value={selectedUnitKerja}
              onChange={(e) => setSelectedUnitKerja(e.target.value)}
              className="w-full px-3 py-2 bg-[#f5f5f5] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
            >
              <option value="all">Semua Unit Kerja</option>
              {workUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button onClick={handleFilter} isLoading={isLoading} size="md">
            Terapkan Filter
          </Button>

          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={filteredData.length === 0}
            size="md"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama anak magang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#006761]"
          />
        </div>

        <span className="text-xs text-gray-400">
          Periode: <strong>{BULAN_NAMES[bulan - 1]} {tahun}</strong> ({filteredData.length} data)
        </span>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(item) => item.userId}
        emptyMessage="Tidak ada data rekap absensi untuk periode ini."
        isLoading={isLoading}
      />
    </div>
  );
}
