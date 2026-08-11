"use client";

import React, { useState } from "react";
import {
  InternListItem,
  toggleInternStatusAction,
  resetInternPasswordAction,
} from "@/actions/intern";
import { WorkUnitWithCount, PositionWithCount } from "@/actions/masterData";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { InternFormModal } from "./InternFormModal";
import { CsvImportModal } from "./CsvImportModal";
import {
  Plus,
  Upload,
  Search,
  Edit2,
  KeyRound,
  UserCheck,
  UserX,
  User,
} from "lucide-react";
import clsx from "clsx";

interface InternTableProps {
  initialData: InternListItem[];
  workUnits: WorkUnitWithCount[];
  positions: PositionWithCount[];
}

export function InternTable({
  initialData,
  workUnits,
  positions,
}: InternTableProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InternListItem | null>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: InternListItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = async (item: InternListItem) => {
    const actionStr = item.statusAktif ? "nonaktifkan" : "aktifkan";
    if (
      !confirm(`Apakah Anda yakin ingin meng-${actionStr} akun ${item.nama}?`)
    ) {
      return;
    }

    const res = await toggleInternStatusAction(item.id);
    if (res?.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const handleResetPassword = async (item: InternListItem) => {
    if (
      !confirm(
        `Reset password ${item.nama} menjadi default "magang123"? Pengguna akan diminta mengubah password saat login berikutnya.`
      )
    ) {
      return;
    }

    const res = await resetInternPasswordAction(item.id);
    if (res?.error) {
      alert(res.error);
    } else {
      alert(`Password ${item.nama} telah di-reset ke "magang123".`);
    }
  };

  // Client-side filtering
  const filteredData = data.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());

    const matchesUnit =
      selectedUnitKerja === "all" || item.unitKerjaId === selectedUnitKerja;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && item.statusAktif) ||
      (selectedStatus === "inactive" && !item.statusAktif);

    return matchesSearch && matchesUnit && matchesStatus;
  });

  const columns = [
    {
      key: "nama",
      header: "Nama & Email",
      render: (row: InternListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#006761]/10 flex items-center justify-center text-[#006761] font-bold text-sm">
            {row.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#1a1c1c] leading-tight">{row.nama}</p>
            <p className="text-xs text-gray-500 mt-0.5">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "unitKerja",
      header: "Unit Kerja & Posisi",
      render: (row: InternListItem) => (
        <div>
          <p className="font-semibold text-gray-800 text-sm">
            {row.unitKerja || "-"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{row.posisi || "-"}</p>
        </div>
      ),
    },
    {
      key: "periode",
      header: "Periode Magang",
      render: (row: InternListItem) => (
        <span className="text-xs text-gray-600 font-medium">
          {row.tanggalMulai || "-"} s/d {row.tanggalSelesai || "-"}
        </span>
      ),
    },
    {
      key: "statusAktif",
      header: "Status",
      render: (row: InternListItem) => (
        <span
          className={clsx(
            "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full",
            row.statusAktif
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-rose-50 text-rose-700 border border-rose-200/60"
          )}
        >
          {row.statusAktif ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right",
      render: (row: InternListItem) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#006761] hover:bg-gray-100 transition-colors"
            title="Edit Data"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleResetPassword(row)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              row.statusAktif
                ? "text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
            )}
            title={row.statusAktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}
          >
            {row.statusAktif ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar: Search, Filters, Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Unit Filter */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#006761] focus:ring-2 focus:ring-[#006761]/15"
            />
          </div>

          <div className="w-48">
            <select
              value={selectedUnitKerja}
              onChange={(e) => setSelectedUnitKerja(e.target.value)}
              className="w-full px-3 py-2.5 bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#006761]"
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

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCsvModalOpen(true)}
            size="md"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </Button>

          <Button onClick={handleOpenAdd} size="md">
            <Plus className="w-4 h-4" />
            <span>Tambah Intern</span>
          </Button>
        </div>
      </div>

      {/* Tabs Filter: Status */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            { key: "all", label: "Semua", count: data.length },
            {
              key: "active",
              label: "Aktif",
              count: data.filter((d) => d.statusAktif).length,
            },
            {
              key: "inactive",
              label: "Nonaktif",
              count: data.filter((d) => !d.statusAktif).length,
            },
          ]}
          activeKey={selectedStatus}
          onChange={setSelectedStatus}
        />
        <span className="text-xs text-gray-400">
          Menampilkan {filteredData.length} dari {data.length} akun
        </span>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(item) => item.id}
        emptyMessage="Tidak ada data anak magang yang cocok dengan filter."
      />

      {/* Modals */}
      <InternFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        editingItem={editingItem}
        workUnits={workUnits}
        positions={positions}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
    </div>
  );
}
