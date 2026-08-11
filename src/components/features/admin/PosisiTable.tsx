"use client";

import React, { useState } from "react";
import {
  PositionWithCount,
  createPositionAction,
  updatePositionAction,
  deletePositionAction,
} from "@/actions/masterData";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Briefcase } from "lucide-react";

interface PosisiTableProps {
  initialData: PositionWithCount[];
}

export function PosisiTable({ initialData }: PosisiTableProps) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PositionWithCount | null>(null);

  const [nama, setNama] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNama("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PositionWithCount) => {
    setEditingItem(item);
    setNama(item.nama);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let res;
    if (editingItem) {
      res = await updatePositionAction(editingItem.id, nama);
    } else {
      res = await createPositionAction(nama);
    }

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const handleDelete = async (item: PositionWithCount) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus posisi "${item.nama}"?`)) {
      return;
    }

    const res = await deletePositionAction(item.id);
    if (res?.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const columns = [
    {
      key: "nama",
      header: "Nama Posisi",
      render: (row: PositionWithCount) => (
        <div className="flex items-center gap-3 font-semibold text-[#1a1c1c]">
          <div className="w-8 h-8 rounded-lg bg-[#006761]/10 flex items-center justify-center text-[#006761]">
            <Briefcase className="w-4 h-4" />
          </div>
          <span>{row.nama}</span>
        </div>
      ),
    },
    {
      key: "internCount",
      header: "Jumlah Anak Magang",
      render: (row: PositionWithCount) => (
        <span className="text-sm font-medium text-gray-600">
          {row.internCount} orang
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right",
      render: (row: PositionWithCount) => (
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Total {data.length} posisi terdaftar
        </p>
        <Button onClick={handleOpenAddModal} size="md">
          <Plus className="w-4 h-4" />
          <span>Tambah Posisi</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada posisi. Klik Tambah Posisi untuk membuat baru."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Posisi" : "Tambah Posisi"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Nama Posisi *"
            placeholder="Misal: Frontend Developer"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
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
