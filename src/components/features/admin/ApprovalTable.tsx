"use client";

import React, { useState } from "react";
import {
  LeaveRequestForAdmin,
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
} from "@/actions/approval";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { Tabs } from "@/components/ui/Tabs";
import { Check, X, FileText, ExternalLink } from "lucide-react";

interface ApprovalTableProps {
  initialData: LeaveRequestForAdmin[];
}

export function ApprovalTable({ initialData }: ApprovalTableProps) {
  const [data, setData] = useState(initialData);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menyetujui pengajuan ini?")) return;

    setLoadingId(id);
    const res = await approveLeaveRequestAction(id);
    setLoadingId(null);

    if (res?.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menolak pengajuan ini?")) return;

    setLoadingId(id);
    const res = await rejectLeaveRequestAction(id);
    setLoadingId(null);

    if (res?.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const filteredData = data.filter((item) => {
    if (selectedStatus === "all") return true;
    return item.statusApproval === selectedStatus;
  });

  const columns = [
    {
      key: "userName",
      header: "Nama & Email",
      render: (row: LeaveRequestForAdmin) => (
        <div>
          <p className="font-bold text-[#1a1c1c] text-sm">{row.userName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.userEmail}</p>
        </div>
      ),
    },
    {
      key: "jenis",
      header: "Jenis",
      render: (row: LeaveRequestForAdmin) => (
        <StatusChip status={row.jenis} />
      ),
    },
    {
      key: "periode",
      header: "Tanggal Izin",
      render: (row: LeaveRequestForAdmin) => (
        <div className="text-xs text-gray-700 font-medium">
          <p>
            {row.tanggalMulai} s/d {row.tanggalSelesai}
          </p>
        </div>
      ),
    },
    {
      key: "keterangan",
      header: "Keterangan / Alasan",
      render: (row: LeaveRequestForAdmin) => (
        <p className="text-xs text-gray-600 max-w-xs line-clamp-2">
          {row.keterangan}
        </p>
      ),
    },
    {
      key: "fileSuratUrl",
      header: "Surat Pendukung",
      render: (row: LeaveRequestForAdmin) =>
        row.fileSuratUrl ? (
          <a
            href={row.fileSuratUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#006761] hover:underline"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lihat Surat</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: "statusApproval",
      header: "Status Approval",
      render: (row: LeaveRequestForAdmin) => (
        <StatusChip status={row.statusApproval} />
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "text-right",
      render: (row: LeaveRequestForAdmin) =>
        row.statusApproval === "pending" ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApprove(row.id)}
              isLoading={loadingId === row.id}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Setujui</span>
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleReject(row.id)}
              isLoading={loadingId === row.id}
            >
              <X className="w-3.5 h-3.5" />
              <span>Tolak</span>
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Selesai</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Filter */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            {
              key: "pending",
              label: "Pending",
              count: data.filter((d) => d.statusApproval === "pending").length,
            },
            {
              key: "approved",
              label: "Disetujui",
              count: data.filter((d) => d.statusApproval === "approved").length,
            },
            {
              key: "rejected",
              label: "Ditolak",
              count: data.filter((d) => d.statusApproval === "rejected").length,
            },
            { key: "all", label: "Semua", count: data.length },
          ]}
          activeKey={selectedStatus}
          onChange={setSelectedStatus}
        />
        <span className="text-xs text-gray-400">
          Menampilkan {filteredData.length} pengajuan
        </span>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        keyExtractor={(item) => item.id}
        emptyMessage="Tidak ada pengajuan izin/sakit pada status ini."
      />
    </div>
  );
}
