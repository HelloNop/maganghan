"use client";

import React, { useState } from "react";
import {
  AdminListItem,
  toggleAdminStatusAction,
  resetAdminUserPasswordAction,
} from "@/actions/adminUser";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { AdminUserModal } from "./AdminUserModal";
import { Search, Plus, ShieldCheck, UserCheck, UserX, KeyRound } from "lucide-react";
import clsx from "clsx";

interface AdminUserTableProps {
  initialData: AdminListItem[];
  currentUserId: string;
}

export function AdminUserTable({ initialData, currentUserId }: AdminUserTableProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [resetTarget, setResetTarget] = useState<AdminListItem | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [resetMsg, setResetMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleToggleStatus = async (targetId: string) => {
    const res = await toggleAdminStatusAction(targetId);
    if (res.success && res.newStatus !== undefined) {
      setData((prev) =>
        prev.map((item) =>
          item.id === targetId ? { ...item, statusAktif: res.newStatus! } : item
        )
      );
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    setResetMsg(null);
    setIsResetting(true);

    const res = await resetAdminUserPasswordAction(resetTarget.id, newResetPassword);
    setIsResetting(false);

    if (res.error) {
      setResetMsg({ type: "error", text: res.error });
    } else {
      setResetMsg({ type: "success", text: `Password untuk ${resetTarget.nama} berhasil direset!` });
      setTimeout(() => {
        setResetTarget(null);
        setNewResetPassword("");
        setResetMsg(null);
      }, 1500);
    }
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
      header: "Nama Administrator",
      render: (row: AdminListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#006761]/10 flex items-center justify-center text-sm font-bold text-[#006761]">
            {row.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#1a1c1c] text-sm">{row.nama}</p>
              {row.id === currentUserId && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#006761] text-white rounded-full">
                  Akun Anda
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Tanggal Dibuat",
      render: (row: AdminListItem) => (
        <span className="text-xs font-medium text-gray-600">
          {new Date(row.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "statusAktif",
      header: "Status",
      render: (row: AdminListItem) => (
        <span
          className={clsx(
            "px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1",
            row.statusAktif
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          )}
        >
          {row.statusAktif ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (row: AdminListItem) => {
        const isSelf = row.id === currentUserId;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setResetTarget(row);
                setNewResetPassword("");
                setResetMsg(null);
              }}
              title="Reset Password"
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {!isSelf && (
              <button
                onClick={() => handleToggleStatus(row.id)}
                title={row.statusAktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                className={clsx(
                  "p-1.5 rounded-lg transition-colors",
                  row.statusAktif
                    ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                )}
              >
                {row.statusAktif ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#006761]"
          />
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} size="md">
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Admin</span>
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada data admin lain."
      />

      {/* Modal Add Admin */}
      <AdminUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modal Reset Password */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#1a1c1c]">
              Reset Password Admin: {resetTarget.nama}
            </h3>

            {resetMsg && (
              <div
                className={`p-3 text-xs font-semibold rounded-xl ${
                  resetMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-rose-50 text-rose-800"
                }`}
              >
                {resetMsg.text}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f5f5f5] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetTarget(null)}
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isResetting}>
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
