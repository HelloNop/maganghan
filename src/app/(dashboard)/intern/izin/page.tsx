"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  submitLeaveRequestAction,
  getLeaveRequestsAction,
} from "@/actions/leaveRequest";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Send, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function IzinPage() {
  const router = useRouter();

  const [jenis, setJenis] = useState<"izin" | "sakit">("izin");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [fileSurat, setFileSurat] = useState<File | null>(null);

  const [leaveList, setLeaveList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const loadRequests = async () => {
    setIsLoadingList(true);
    const data = await getLeaveRequestsAction();
    setLeaveList(data);
    setIsLoadingList(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!tanggalMulai || !tanggalSelesai || !keterangan) {
      setError("Semua kolom bertanda * wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("jenis", jenis);
    formData.append("tanggalMulai", tanggalMulai);
    formData.append("tanggalSelesai", tanggalSelesai);
    formData.append("keterangan", keterangan);
    if (fileSurat) {
      formData.append("fileSurat", fileSurat);
    }

    const res = await submitLeaveRequestAction(formData);

    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
      setTanggalMulai("");
      setTanggalSelesai("");
      setKeterangan("");
      setFileSurat(null);
      await loadRequests();
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-[#006761] uppercase tracking-wider">
          Green Attendance
        </span>
        <h1 className="text-xl font-bold text-[#1a1c1c] tracking-tight">
          Pengajuan Izin
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Isi form di bawah ini untuk mengajukan izin ketidakhadiran.
        </p>
      </div>

      {/* Leave Request Form */}
      <Card variant="elevated" className="p-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Pengajuan izin berhasil dikirim ke Admin!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3d4947]">
              Jenis Izin *
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value as "izin" | "sakit")}
              className="w-full px-4 py-3 bg-[#f5f5f5] text-[#1a1c1c] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
            >
              <option value="izin">Izin (Keperluan Pribadi / Acara)</option>
              <option value="sakit">Sakit (Dengan / Tanpa Surat Dokter)</option>
            </select>
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

          {/* Upload File Section */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3d4947]">
              Unggah Lampiran (Opsional)
            </label>
            <label className="border-2 border-dashed border-gray-200 hover:border-[#006761] bg-[#f9f9f9] hover:bg-[#f0faf8] rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5">
              <Upload className="w-6 h-6 text-[#006761]" />
              <span className="text-xs font-medium text-gray-700">
                {fileSurat ? fileSurat.name : "Klik untuk mengunggah atau seret file ke sini"}
              </span>
              <span className="text-[10px] text-gray-400">
                (Maks 5MB: JPG, PNG, PDF)
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileSurat(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Reason Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3d4947]">
              Alasan *
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan alasan pengajuan izin secara detail..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5] text-[#1a1c1c] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3.5 text-base font-semibold mt-2"
          >
            <Send className="w-4 h-4 mr-2" />
            Kirim Pengajuan
          </Button>
        </form>
      </Card>

      {/* History of Leave Requests */}
      <div>
        <h2 className="text-base font-bold text-[#1a1c1c] mb-3">
          Riwayat Pengajuan Izin
        </h2>

        {isLoadingList ? (
          <div className="text-center py-6 text-xs text-gray-400">
            Memuat riwayat pengajuan...
          </div>
        ) : leaveList.length === 0 ? (
          <Card variant="flat" className="p-6 text-center text-xs text-gray-500">
            Belum ada riwayat pengajuan izin.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {leaveList.map((item) => (
              <Card key={item.id} variant="default" className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1a1c1c] capitalize">
                    {item.jenis} ({item.tanggalMulai} s/d {item.tanggalSelesai})
                  </span>
                  <StatusChip status={item.statusApproval} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.keterangan}
                </p>
                {item.fileSuratUrl && (
                  <a
                    href={item.fileSuratUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#006761] hover:underline mt-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lihat Lampiran Surat
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
