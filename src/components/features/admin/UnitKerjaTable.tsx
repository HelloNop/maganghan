"use client";

import React, { useState } from "react";
import {
  WorkUnitWithCount,
  createWorkUnitAction,
  updateWorkUnitAction,
  deleteWorkUnitAction,
} from "@/actions/masterData";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";

interface UnitKerjaTableProps {
  initialData: WorkUnitWithCount[];
}

export function UnitKerjaTable({ initialData }: UnitKerjaTableProps) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkUnitWithCount | null>(null);

  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNama("");
    setKode("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: WorkUnitWithCount) => {
    setEditingItem(item);
    setNama(item.nama);
    setKode(item.kode || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let res;
    if (editingItem) {
      res = await updateWorkUnitAction(editingItem.id, nama, kode);
    } else {
      res = await createWorkUnitAction(nama, kode);
    }

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const handleDelete = async (item: WorkUnitWithCount) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus unit kerja "${item.nama}"?`
      )
    ) {
      return;
    }

    const res = await deleteWorkUnitAction(item.id);
    if (res?.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const columns = [
    {
      key: "nama",
      header: "Nama Unit Kerja",
      render: (row: WorkUnitWithCount) => (
        <div className="flex items-center gap-3 font-semibold text-[#1a1c1c]">
          <div className="w-8 h-8 rounded-lg bg-[#006761]/10 flex items-center justify-center text-[#006761]">
            <Building2 className="w-4 h-4" />
          </div>
          <span>{row.nama}</span>
        </div>
      ),
    },
    {
      key: "kode",
      header: "Kode",
      render: (row: WorkUnitWithCount) => (
        <span className="font-mono text-xs px-2.5 py-1 bg-gray-100 rounded-md font-medium text-gray-600">
          {row.kode || "-"}
        </span>
      ),
    },
    {
      key: "internCount",
      header: "Jumlah Anak Magang",
      render: (row: WorkUnitWithCount) => (
        <span className="text-sm font-medium text-gray-600">
          {row.internCount} orang
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right",
      render: (row: WorkUnitWithCount) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#006761] hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Total {data.length} unit kerja terdaftar
        </p>
        <Button onClick={handleOpenAddModal} size="md">
          <Plus className="w-4 h-4" />
          <span>Tambah Unit Kerja</span>
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada unit kerja. Klik Tambah Unit Kerja untuk membuat baru."
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Unit Kerja" : "Tambah Unit Kerja"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Nama Unit Kerja *"
            placeholder="Misal: Divisi Teknologi Informasi"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <Input
            label="Kode Unit Kerja (Opsional)"
            placeholder="Misal: TI"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingItem ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
