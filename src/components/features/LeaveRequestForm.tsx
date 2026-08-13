"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitLeaveRequestAction } from "@/actions/leaveRequest";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  FileText,
  X,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { uploadToR2 } from "@/lib/utils/uploadToR2";

export function LeaveRequestForm() {
  const router = useRouter();

  const [jenis, setJenis] = useState<"izin" | "sakit">("izin");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [fileSurat, setFileSurat] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Generate object URL for file preview
  useEffect(() => {
    if (!fileSurat) {
      setFilePreviewUrl(null);
      return;
    }

    if (fileSurat.type.startsWith("image/")) {
      const url = URL.createObjectURL(fileSurat);
      setFilePreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setFilePreviewUrl(null);
    }
  }, [fileSurat]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileSurat(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFileSurat(null);
    setFilePreviewUrl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

    try {
      let fileSuratObjectKey = "";

      // Upload file directly to R2 if present
      if (fileSurat) {
        fileSuratObjectKey = await uploadToR2(fileSurat, "surat_izin");
      }

      const formData = new FormData();
      formData.append("jenis", jenis);
      formData.append("tanggalMulai", tanggalMulai);
      formData.append("tanggalSelesai", tanggalSelesai);
      formData.append("keterangan", keterangan);
      if (fileSuratObjectKey) {
        formData.append("fileSuratObjectKey", fileSuratObjectKey);
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
        setFilePreviewUrl(null);
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengunggah file.";
      setError(message);
      setIsSubmitting(false);
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

        {/* Upload File & Interactive Preview Section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#3d4947]">
            Unggah Lampiran Surat / Dokter (Opsional)
          </label>

          {!fileSurat ? (
            <label className="border-2 border-dashed border-gray-200 hover:border-[#006761] bg-[#f9f9f9] hover:bg-[#f0faf8] rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 group">
              <div className="w-10 h-10 rounded-full bg-[#006761]/10 text-[#006761] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-800 mt-1">
                Klik untuk mengunggah berkas
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Mendukung Foto (JPG, PNG, WebP) atau Dokumen PDF (Maks 10 MB)
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="p-3.5 bg-[#f0faf8] border border-[#006761]/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Image Preview Thumbnail or PDF Icon */}
                {filePreviewUrl ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#006761]/30 shrink-0 bg-white shadow-2xs">
                    <img
                      src={filePreviewUrl}
                      alt="Preview Lampiran"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 text-red-700 flex flex-col items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                    <span className="text-[8px] font-extrabold tracking-tighter uppercase">
                      PDF
                    </span>
                  </div>
                )}

                {/* File Info */}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1a1c1c] truncate">
                    {fileSurat.name}
                  </p>
                  <p className="text-[11px] text-[#006761] font-medium mt-0.5">
                    {formatFileSize(fileSurat.size)} • {fileSurat.type || "Dokumen"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="p-1.5 text-xs font-semibold text-[#006761] hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                  Ganti
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Lampiran"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
