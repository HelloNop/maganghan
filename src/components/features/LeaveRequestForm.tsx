"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitLeaveRequestAction } from "@/actions/leaveRequest";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Send, Upload, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";

export function LeaveRequestForm() {
  const router = useRouter();

  const [jenis, setJenis] = useState<"izin" | "sakit">("izin");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [fileSurat, setFileSurat] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!tanggalMulai || !tanggalSelesai || !keterangan) {
      setError("Semua kolom bertanda * wajib diisi.");
      return;
    }

    if (tanggalMulai > tanggalSelesai) {
      setError("Tanggal mulai tidak boleh lebih dari tanggal selesai.");
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
      router.refresh();
    }
  };

  return (
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
          <div className="relative">
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value as "izin" | "sakit")}
              className="w-full pl-4 pr-11 py-3 bg-[#f5f5f5] text-[#1a1c1c] text-sm rounded-xl border border-transparent appearance-none cursor-pointer focus:outline-none focus:bg-white focus:border-[#006761] focus:ring-2 focus:ring-[#006761]/15 transition-all duration-200"
            >
              <option value="izin">Izin (Keperluan Pribadi / Acara)</option>
              <option value="sakit">Sakit (Dengan / Tanpa Surat Dokter)</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
          className="w-full py-3.5 text-base font-semibold mt-2 shadow-lg shadow-[#006761]/20"
        >
          <Send className="w-4 h-4 mr-2" />
          Kirim Pengajuan
        </Button>
      </form>
    </Card>
  );
}
