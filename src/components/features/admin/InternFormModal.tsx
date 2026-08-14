"use client";

import React, { useState, useEffect } from "react";
import { InternListItem, createInternAction, updateInternAction } from "@/actions/intern";
import { WorkUnitWithCount, PositionWithCount } from "@/actions/masterData";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface InternFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: InternListItem | null;
  workUnits: WorkUnitWithCount[];
  positions: PositionWithCount[];
}

export function InternFormModal({
  isOpen,
  onClose,
  editingItem,
  workUnits,
  positions,
}: InternFormModalProps) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [unitKerjaId, setUnitKerjaId] = useState("");
  const [posisiId, setPosisiId] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setNama(editingItem.nama);
      setEmail(editingItem.email);
      setUnitKerjaId(editingItem.unitKerjaId || "");
      setPosisiId(editingItem.posisiId || "");
      setTanggalMulai(editingItem.tanggalMulai || "");
      setTanggalSelesai(editingItem.tanggalSelesai || "");
    } else {
      setNama("");
      setEmail("");
      setUnitKerjaId("");
      setPosisiId("");
      setTanggalMulai("");
      setTanggalSelesai("");
    }
    setError(null);
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      nama,
      email,
      unitKerjaId,
      posisiId,
      tanggalMulai,
      tanggalSelesai,
    };

    let res;
    if (editingItem) {
      res = await updateInternAction(editingItem.id, payload);
    } else {
      res = await createInternAction(payload);
    }

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      onClose();
      window.location.reload();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Data Anak Magang" : "Tambah Anak Magang"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {!editingItem && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
            Password awal untuk login baru adalah <strong className="font-mono">Magang123!</strong>. Anak magang akan diminta mengubah password saat login pertama.
          </div>
        )}

        <Input
          label="Nama Lengkap *"
          placeholder="Misal: Ahmad Fajar"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />

        <Input
          label="Email *"
          type="email"
          placeholder="ahmad@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Unit Kerja"
            placeholder="Pilih Unit Kerja"
            value={unitKerjaId}
            onChange={(e) => setUnitKerjaId(e.target.value)}
            options={workUnits.map((u) => ({ value: u.id, label: u.nama }))}
          />

          <Select
            label="Posisi"
            placeholder="Pilih Posisi"
            value={posisiId}
            onChange={(e) => setPosisiId(e.target.value)}
            options={positions.map((p) => ({ value: p.id, label: p.nama }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tanggal Mulai *"
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            required
          />

          <Input
            label="Tanggal Selesai *"
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {editingItem ? "Simpan Perubahan" : "Tambah Intern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
