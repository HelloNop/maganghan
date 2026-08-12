"use client";

import React, { useState } from "react";
import {
  TodayAttendanceAuditItem,
  getTodayAttendanceAuditAction,
} from "@/actions/admin";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  Camera,
  Search,
  Clock,
  MapPin,
  X,
  UserCheck,
  Building2,
  Calendar,
} from "lucide-react";
import clsx from "clsx";

interface TodayPhotoAuditFeedProps {
  initialData: TodayAttendanceAuditItem[];
}

export function TodayPhotoAuditFeed({ initialData }: TodayPhotoAuditFeedProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const handleFilterChange = async (newStatus: string) => {
    setStatusFilter(newStatus);
    setIsLoading(true);
    const updated = await getTodayAttendanceAuditAction(newStatus);
    setData(updated);
    setIsLoading(false);
  };

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
    return (
      item.nama.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (dateObj: Date | null) => {
    if (!dateObj) return "--:--";
    return new Date(dateObj).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card variant="default" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#006761]" />
            <h2 className="text-base font-bold text-[#1a1c1c]">
              Audit Foto Selfie Presensi Hari Ini
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Feed verifikasi visual foto selfie dan lokasi GPS presensi anak magang hari ini.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-xl border border-gray-200/60">
          {[
            { key: "all", label: "Semua" },
            { key: "hadir", label: "Hadir" },
            { key: "telat", label: "Telat" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={clsx(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                statusFilter === tab.key
                  ? "bg-white text-[#006761] shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari foto presensi nama anak magang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f5] text-sm rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-[#006761]"
        />
      </div>

      {/* Audit Feed Grid */}
      {isLoading ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#006761] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Memuat audit foto presensi...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm flex flex-col items-center">
          <Camera className="w-10 h-10 mb-2 opacity-30 text-[#006761]" />
          Belum ada foto presensi masuk yang tercatat untuk filter ini hari ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-2xl border border-gray-150 hover:border-[#006761]/40 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              {/* User Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1a1c1c] leading-tight">
                    {item.nama}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.email}</p>
                  {item.unitKerja && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-md">
                      {item.unitKerja} {item.posisi ? `• ${item.posisi}` : ""}
                    </span>
                  )}
                </div>
                <StatusChip status={item.status} />
              </div>

              {/* Photos Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Foto Masuk */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" /> Masuk: {formatTime(item.jamMasuk)}
                  </span>
                  {item.fotoMasukUrl ? (
                    <div
                      onClick={() =>
                        setPreviewImage({
                          url: item.fotoMasukUrl!,
                          title: `Foto Selfie Masuk - ${item.nama} (${formatTime(item.jamMasuk)})`,
                        })
                      }
                      className="relative group h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                    >
                      <img
                        src={item.fotoMasukUrl}
                        alt="Selfie Masuk"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        <Camera className="w-4 h-4 mr-1" /> Perbesar
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-[11px]">
                      Tanpa Foto
                    </div>
                  )}
                </div>

                {/* Foto Keluar */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Keluar: {formatTime(item.jamKeluar)}
                  </span>
                  {item.fotoKeluarUrl ? (
                    <div
                      onClick={() =>
                        setPreviewImage({
                          url: item.fotoKeluarUrl!,
                          title: `Foto Selfie Keluar - ${item.nama} (${formatTime(item.jamKeluar)})`,
                        })
                      }
                      className="relative group h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                    >
                      <img
                        src={item.fotoKeluarUrl}
                        alt="Selfie Keluar"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        <Camera className="w-4 h-4 mr-1" /> Perbesar
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-[11px]">
                      Belum Pulang
                    </div>
                  )}
                </div>
              </div>

              {/* GPS Info */}
              {item.lokasiMasuk && (
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1" title={item.lokasiMasuk}>
                    {item.lokasiMasuk}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="text-xs font-bold text-[#1a1c1c] truncate">
                {previewImage.title}
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewImage.url}
              alt="Preview Audit Foto"
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
