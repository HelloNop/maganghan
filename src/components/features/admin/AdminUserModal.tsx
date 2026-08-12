"use client";

import React, { useState } from "react";
import { createAdminUserAction } from "@/actions/adminUser";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminUserModal({ isOpen, onClose }: AdminUserModalProps) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await createAdminUserAction({ nama, email, password });
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setNama("");
      setEmail("");
      setPassword("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Akun Admin Baru">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <Input
          label="Nama Lengkap Admin"
          type="text"
          placeholder="Contoh: Admin Utama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />

        <Input
          label="Alamat Email (Login)"
          type="email"
          placeholder="admin@instansi.go.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password Default"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Simpan Akun Admin
          </Button>
        </div>
      </form>
    </Modal>
  );
}
