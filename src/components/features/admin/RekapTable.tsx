"use client";

import React, { useState } from "react";
import ExcelJS from "exceljs";
import {
  RekapItem,
  getAttendanceRekapAction,
  getFullAttendanceMatrixAction,
} from "@/actions/rekap";
import { WorkUnitWithCount } from "@/actions/masterData";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Search, Download, Calendar, Building2, Eye } from "lucide-react";
import clsx from "clsx";
import { InternDetailModal } from "./InternDetailModal";

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
  const [data, setData] = useState<RekapItem[]>(initialData);
  const [bulan, setBulan] = useState(currentBulan);
  const [tahun, setTahun] = useState(currentTahun);
  const [selectedUnitKerja, setSelectedUnitKerja] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleFilterChange = async (
    newBulan: number,
    newTahun: number,
    newUnitKerja: string
  ) => {
    setBulan(newBulan);
    setTahun(newTahun);
    setSelectedUnitKerja(newUnitKerja);
    setIsLoading(true);

    const res = await getAttendanceRekapAction(newBulan, newTahun, newUnitKerja);
    setData(res);
    setIsLoading(false);
  };

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
    return (
      item.nama.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenDetail = (userId: string) => {
    setSelectedInternId(userId);
    setIsDetailOpen(true);
  };

  const handleExportExcel = async () => {
    if (data.length === 0) return;
    setIsExporting(true);

    try {
      const matrixResult = await getFullAttendanceMatrixAction(
        bulan,
        tahun,
        selectedUnitKerja
      );

      const workbook = new ExcelJS.Workbook();

      // --- TAB 1: RINGKASAN PRESENSI ---
      const summarySheet = workbook.addWorksheet("Ringkasan Presensi");
      summarySheet.columns = [
        { header: "No", key: "No", width: 6 },
        { header: "Nama", key: "Nama", width: 25 },
        { header: "Email", key: "Email", width: 25 },
        { header: "Unit Kerja", key: "Unit Kerja", width: 20 },
        { header: "Posisi", key: "Posisi", width: 20 },
        { header: "Hadir (Tepat Waktu)", key: "Hadir (Tepat Waktu)", width: 20 },
        { header: "Terlambat", key: "Terlambat", width: 12 },
        { header: "Izin", key: "Izin", width: 10 },
        { header: "Sakit", key: "Sakit", width: 10 },
        { header: "Alpha", key: "Alpha", width: 10 },
        { header: "Total Recorded Hari", key: "Total Recorded Hari", width: 20 },
        { header: "% Kehadiran", key: "% Kehadiran", width: 15 },
      ];

      filteredData.forEach((item, idx) => {
        summarySheet.addRow({
          No: idx + 1,
          Nama: item.nama,
          Email: item.email,
          "Unit Kerja": item.unitKerja || "-",
          Posisi: item.posisi || "-",
          "Hadir (Tepat Waktu)": item.hadir,
          Terlambat: item.telat,
          Izin: item.izin,
          Sakit: item.sakit,
          Alpha: item.alpha,
          "Total Recorded Hari": item.totalHariKerja,
          "% Kehadiran": `${item.persentaseKehadiran}%`,
        });
      });

      // --- TAB 2: PRESENSI HARIAN (FULL MATRIX) ---
      if (matrixResult && matrixResult.items.length > 0) {
        const lastDay = matrixResult.lastDay;
        const matrixSheet = workbook.addWorksheet("Presensi Harian (Full)");

        const matrixCols: { header: string; key: string; width: number }[] = [
          { header: "No", key: "No", width: 6 },
          { header: "Nama", key: "Nama", width: 25 },
          { header: "Email", key: "Email", width: 25 },
          { header: "Unit Kerja", key: "Unit Kerja", width: 20 },
          { header: "Posisi", key: "Posisi", width: 20 },
        ];

        for (let day = 1; day <= lastDay; day++) {
          matrixCols.push({
            header: `Tgl ${String(day).padStart(2, "0")}`,
            key: `tgl_${day}`,
            width: 14,
          });
        }

        matrixCols.push(
          { header: "Total Hadir", key: "total_hadir", width: 12 },
          { header: "Total Telat", key: "total_telat", width: 12 },
          { header: "Total Izin", key: "total_izin", width: 12 },
          { header: "Total Sakit", key: "total_sakit", width: 12 },
          { header: "Total Alpha", key: "total_alpha", width: 12 },
          { header: "% Kehadiran", key: "persentase", width: 14 }
        );

        matrixSheet.columns = matrixCols;

        const filteredMatrixItems = matrixResult.items.filter((item) => {
          if (!search.trim()) return true;
          const searchLower = search.toLowerCase().trim();
          return (
            item.nama.toLowerCase().includes(searchLower) ||
            item.email.toLowerCase().includes(searchLower)
          );
        });

        filteredMatrixItems.forEach((item, idx) => {
          const rowObj: Record<string, unknown> = {
            No: idx + 1,
            Nama: item.nama,
            Email: item.email,
            "Unit Kerja": item.unitKerja || "-",
            Posisi: item.posisi || "-",
          };

          for (let day = 1; day <= lastDay; day++) {
            const dateKey = `tgl_${day}`;
            const info = item.dailyStatus[day];

            if (!info) {
              rowObj[dateKey] = "-";
              continue;
            }

            if (info.status === "hadir") {
              rowObj[dateKey] = info.jamMasukStr ? `H (${info.jamMasukStr})` : "Hadir";
            } else if (info.status === "telat") {
              rowObj[dateKey] = info.jamMasukStr ? `T (${info.jamMasukStr})` : "Telat";
            } else if (info.status === "izin") {
              rowObj[dateKey] = "Izin";
            } else if (info.status === "sakit") {
              rowObj[dateKey] = "Sakit";
            } else if (info.status === "alpha") {
              rowObj[dateKey] = "Alpha";
            } else if (info.status === "libur") {
              rowObj[dateKey] = "Libur";
            } else {
              rowObj[dateKey] = "-";
            }
          }

          rowObj["total_hadir"] = item.hadir;
          rowObj["total_telat"] = item.telat;
          rowObj["total_izin"] = item.izin;
          rowObj["total_sakit"] = item.sakit;
          rowObj["total_alpha"] = item.alpha;
          rowObj["persentase"] = `${item.persentaseKehadiran}%`;

          matrixSheet.addRow(rowObj);
        });
      }

      const bulanName = BULAN_NAMES[bulan - 1];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rekap_Absensi_Lengkap_${bulanName}_${tahun}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      key: "nama",
      header: "Nama & Email",
      render: (row: RekapItem) => (
        <button
          type="button"
          onClick={() => handleOpenDetail(row.userId)}
          className="text-left group flex items-start gap-1.5 focus:outline-none"
        >
          <div>
            <p className="font-bold text-[#1a1c1c] text-sm group-hover:text-[#006761] group-hover:underline flex items-center gap-1.5 transition-colors">
              {row.nama}
              <Eye className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{row.email}</p>
          </div>
        </button>
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
    {
      key: "actions",
      header: "Aksi",
      render: (row: RekapItem) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenDetail(row.userId)}
          className="text-xs py-1 px-2.5 flex items-center gap-1 hover:bg-[#006761]/5 hover:border-[#006761] hover:text-[#006761]"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Detail Kalender</span>
        </Button>
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
              onChange={(e) => handleFilterChange(Number(e.target.value), tahun, selectedUnitKerja)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#f5f5f5] text-[#1a1c1c] font-medium text-sm rounded-xl border border-transparent transition-all focus:outline-none focus:bg-white focus:border-[#006761] focus:ring-2 focus:ring-[#006761]/15 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_14px_center] bg-no-repeat cursor-pointer"
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
              onChange={(e) => handleFilterChange(bulan, Number(e.target.value), selectedUnitKerja)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#f5f5f5] text-[#1a1c1c] font-medium text-sm rounded-xl border border-transparent transition-all focus:outline-none focus:bg-white focus:border-[#006761] focus:ring-2 focus:ring-[#006761]/15 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_14px_center] bg-no-repeat cursor-pointer"
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
              onChange={(e) => handleFilterChange(bulan, tahun, e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#f5f5f5] text-[#1a1c1c] font-medium text-sm rounded-xl border border-transparent transition-all focus:outline-none focus:bg-white focus:border-[#006761] focus:ring-2 focus:ring-[#006761]/15 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_14px_center] bg-no-repeat cursor-pointer"
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
          <Button
            variant="outline"
            onClick={handleExportExcel}
            isLoading={isExporting}
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

      {/* Intern Detail Calendar Modal */}
      <InternDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        userId={selectedInternId}
        initialBulan={bulan}
        initialTahun={tahun}
      />
    </div>
  );
}
