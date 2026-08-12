"use client";

import React, { useState, useEffect } from "react";
import {
  getInternAttendanceDetailAction,
  InternAttendanceDetailResult,
  DailyAttendanceDetail,
} from "@/actions/rekap";
import { Modal } from "@/components/ui/Modal";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  Calendar as CalendarIcon,
  User,
  Clock,
  MapPin,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  HeartPulse,
  Info,
} from "lucide-react";
import clsx from "clsx";

interface InternDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  initialBulan: number;
  initialTahun: number;
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function InternDetailModal({
  isOpen,
  onClose,
  userId,
  initialBulan,
  initialTahun,
}: InternDetailModalProps) {
  const [bulan, setBulan] = useState(initialBulan);
  const [tahun, setTahun] = useState(initialTahun);
  const [data, setData] = useState<InternAttendanceDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyAttendanceDetail | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setBulan(initialBulan);
    setTahun(initialTahun);
  }, [initialBulan, initialTahun]);

  useEffect(() => {
    if (!isOpen || !userId) {
      setData(null);
      setSelectedDay(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getInternAttendanceDetailAction(userId, bulan, tahun).then((res) => {
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, bulan, tahun]);

  if (!isOpen) return null;

  // Calculate day of week offset for day 1 (0 = Monday, 6 = Sunday)
  const getFirstDayOffset = () => {
    const firstDayDate = new Date(tahun, bulan - 1, 1);
    const dayOfWeek = firstDayDate.getDay(); // 0 is Sunday, 1 is Monday...
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Align 0 to Monday
  };

  const offset = getFirstDayOffset();

  const handlePrevMonth = () => {
    if (bulan === 1) {
      setBulan(12);
      setTahun(tahun - 1);
    } else {
      setBulan(bulan - 1);
    }
  };

  const handleNextMonth = () => {
    if (bulan === 12) {
      setBulan(1);
      setTahun(tahun + 1);
    } else {
      setBulan(bulan + 1);
    }
  };

  const formatTime = (dateStr: Date | null) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1a1c1c]">
              {data?.intern.nama || "Detail Kehadiran"}
            </h2>
            {data?.intern.unitKerja && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#006761]/10 text-[#006761] rounded-full">
                {data.intern.unitKerja}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {data?.intern.email} {data?.intern.posisi ? `• ${data.intern.posisi}` : ""}
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-[#f5f5f5] p-1.5 rounded-xl border border-gray-200/60">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-white text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#1a1c1c] px-2 min-w-[110px] text-center">
            {BULAN_NAMES[bulan - 1]} {tahun}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-white text-gray-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-[#006761] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Memuat detail rekap absensi...</p>
        </div>
      ) : data ? (
        <div className="mt-4 space-y-6">
          {/* Summary Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <span className="text-xs font-medium text-emerald-700 block">Hadir</span>
              <span className="text-lg font-bold text-emerald-800">{data.stats.hadir}</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <span className="text-xs font-medium text-amber-700 block">Telat</span>
              <span className="text-lg font-bold text-amber-800">{data.stats.telat}</span>
            </div>
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-center">
              <span className="text-xs font-medium text-sky-700 block">Izin</span>
              <span className="text-lg font-bold text-sky-800">{data.stats.izin}</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-center">
              <span className="text-xs font-medium text-purple-700 block">Sakit</span>
              <span className="text-lg font-bold text-purple-800">{data.stats.sakit}</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
              <span className="text-xs font-medium text-rose-700 block">Alpha</span>
              <span className="text-lg font-bold text-rose-800">{data.stats.alpha}</span>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-xs font-medium text-[#006761] block">% Hadir</span>
              <span className="text-lg font-bold text-[#006761]">
                {data.stats.persentaseKehadiran}%
              </span>
            </div>
          </div>

          {/* Calendar Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="font-semibold text-gray-600">Penanda Warna:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Hadir (Hijau)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Telat (Kuning)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-sky-700">
                <span className="w-3 h-3 rounded-full bg-sky-500" /> Izin (Biru)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-500" /> Sakit (Ungu)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-700">
                <span className="w-3 h-3 rounded-full bg-rose-500" /> Alpha (Merah)
              </span>
            </div>
          </div>

          {/* Calendar Date Matrix */}
          <div>
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
              {DAY_HEADERS.map((h, i) => (
                <div
                  key={h}
                  className={clsx(
                    "text-xs font-bold py-1.5 uppercase tracking-wider rounded-lg",
                    i >= 5 ? "text-rose-500 bg-rose-50/50" : "text-gray-500 bg-gray-100/60"
                  )}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading offset cells */}
              {Array.from({ length: offset }).map((_, idx) => (
                <div
                  key={`offset-${idx}`}
                  className="h-20 bg-gray-50/40 rounded-xl border border-dashed border-gray-100 opacity-30"
                />
              ))}

              {/* Monthly Date Cells */}
              {data.dailyRecords.map((dayItem) => {
                const att = dayItem.attendance;
                const isSelected = selectedDay?.tanggal === dayItem.tanggal;

                let cardBg = "bg-white border-gray-100 hover:border-gray-300";
                let badgeBg = "bg-gray-100 text-gray-600";
                let badgeText = "-";

                if (dayItem.isWeekend) {
                  cardBg = "bg-gray-50/60 border-gray-100 text-gray-400";
                  badgeText = "Libur";
                  badgeBg = "bg-gray-200/50 text-gray-500";
                }

                if (att) {
                  if (att.status === "hadir") {
                    cardBg = "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400";
                    badgeBg = "bg-emerald-500 text-white font-bold";
                    badgeText = `Hadir (${formatTime(att.jamMasuk)})`;
                  } else if (att.status === "telat") {
                    cardBg = "bg-amber-50/40 border-amber-200 hover:border-amber-400";
                    badgeBg = "bg-amber-500 text-white font-bold";
                    badgeText = `Telat (${formatTime(att.jamMasuk)})`;
                  } else if (att.status === "izin") {
                    cardBg = "bg-sky-50/40 border-sky-200 hover:border-sky-400";
                    badgeBg = "bg-sky-500 text-white font-bold";
                    badgeText = "Izin";
                  } else if (att.status === "sakit") {
                    cardBg = "bg-purple-50/40 border-purple-200 hover:border-purple-400";
                    badgeBg = "bg-purple-500 text-white font-bold";
                    badgeText = "Sakit";
                  } else if (att.status === "alpha") {
                    cardBg = "bg-rose-50/40 border-rose-200 hover:border-rose-400";
                    badgeBg = "bg-rose-500 text-white font-bold";
                    badgeText = "Alpha";
                  }
                }

                return (
                  <button
                    key={dayItem.tanggal}
                    onClick={() => setSelectedDay(dayItem)}
                    className={clsx(
                      "h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all relative group cursor-pointer",
                      cardBg,
                      isSelected && "ring-2 ring-[#006761] shadow-md scale-[1.02] z-10"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={clsx(
                          "text-xs font-bold px-1.5 py-0.5 rounded-md",
                          dayItem.isWeekend
                            ? "text-rose-500 bg-rose-50"
                            : "text-[#1a1c1c] bg-white/80 shadow-2xs"
                        )}
                      >
                        {dayItem.dayNumber}
                      </span>
                      {att?.fotoMasukUrl && (
                        <Camera className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#006761]" />
                      )}
                    </div>

                    <div className="w-full">
                      <span
                        className={clsx(
                          "block text-[10px] px-1.5 py-0.5 rounded-md truncate text-center leading-tight",
                          badgeBg
                        )}
                        title={badgeText}
                      >
                        {badgeText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer/Card */}
          {selectedDay && (
            <div className="p-4 bg-[#f8fafc] border border-gray-200 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#006761]" />
                  <h4 className="text-sm font-bold text-[#1a1c1c]">
                    Detail Tanggal: {selectedDay.dayName}, {selectedDay.dayNumber}{" "}
                    {BULAN_NAMES[bulan - 1]} {tahun}
                  </h4>
                </div>
                {selectedDay.attendance?.status ? (
                  <StatusChip status={selectedDay.attendance.status} />
                ) : selectedDay.isWeekend ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                    Akhir Pekan
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                    Belum ada catatan
                  </span>
                )}
              </div>

              {selectedDay.attendance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Jam & Lokasi Masuk */}
                  <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Clock In (Masuk)
                      </span>
                      <span className="font-bold text-sm text-[#1a1c1c]">
                        {formatTime(selectedDay.attendance.jamMasuk)}
                      </span>
                    </div>
                    {selectedDay.attendance.lokasiMasuk && (
                      <p className="text-xs text-gray-500 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {selectedDay.attendance.lokasiMasuk}
                        </span>
                      </p>
                    )}
                    {selectedDay.attendance.fotoMasukUrl && (
                      <div className="pt-2">
                        <p className="text-[11px] text-gray-400 mb-1">Foto Masuk:</p>
                        <img
                          src={selectedDay.attendance.fotoMasukUrl}
                          alt="Foto Absen Masuk"
                          onClick={() =>
                            setPreviewImage(selectedDay.attendance!.fotoMasukUrl)
                          }
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </div>
                    )}
                  </div>

                  {/* Jam & Lokasi Keluar */}
                  <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Clock Out (Keluar)
                      </span>
                      <span className="font-bold text-sm text-[#1a1c1c]">
                        {formatTime(selectedDay.attendance.jamKeluar)}
                      </span>
                    </div>
                    {selectedDay.attendance.lokasiKeluar && (
                      <p className="text-xs text-gray-500 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {selectedDay.attendance.lokasiKeluar}
                        </span>
                      </p>
                    )}
                    {selectedDay.attendance.fotoKeluarUrl && (
                      <div className="pt-2">
                        <p className="text-[11px] text-gray-400 mb-1">Foto Keluar:</p>
                        <img
                          src={selectedDay.attendance.fotoKeluarUrl}
                          alt="Foto Absen Keluar"
                          onClick={() =>
                            setPreviewImage(selectedDay.attendance!.fotoKeluarUrl)
                          }
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">
                  {selectedDay.isWeekend
                    ? "Hari libur / akhir pekan. Tidak ada kewajiban presensi."
                    : "Tidak ada catatan presensi pada tanggal ini."}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-10">
          Data tidak ditemukan.
        </p>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-white rounded-2xl p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black font-bold text-xl"
            >
              ✕
            </button>
            <h4 className="text-sm font-bold text-[#1a1c1c] mb-3">Preview Foto Selfie</h4>
            <img
              src={previewImage}
              alt="Preview Selfie"
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
