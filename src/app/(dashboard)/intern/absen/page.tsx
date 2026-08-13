"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/features/CameraCapture";
import {
  submitCheckInAction,
  submitCheckOutAction,
  getTodayAttendanceAction,
  getOfficeLocationAction,
} from "@/actions/attendance";
import { calculateDistanceInMeters } from "@/lib/utils/geo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, MapPin, CheckCircle2, AlertTriangle, LogOut, ShieldAlert, CalendarOff } from "lucide-react";
import Link from "next/link";
import { uploadToR2, dataUrlToBlob } from "@/lib/utils/uploadToR2";

export default function AbsenPage() {
  const router = useRouter();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(true);

  const [officeSetting, setOfficeSetting] = useState<{
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [mode, setMode] = useState<"checkin" | "checkout">("checkin");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isLeaveOrSakit = todayRecord?.status === "izin" || todayRecord?.status === "sakit";

  // Fetch initial today's attendance status & office location settings
  useEffect(() => {
    async function loadData() {
      const [record, office] = await Promise.all([
        getTodayAttendanceAction(),
        getOfficeLocationAction(),
      ]);
      setTodayRecord(record);
      setOfficeSetting(office);

      if (record?.jamMasuk && !record?.jamKeluar) {
        setMode("checkout");
      }
    }
    loadData();
  }, []);

  // Request client GPS location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung Geolocation.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
        setIsGettingLocation(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setLocationError("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  // Calculate distance in real-time
  let distanceMeters: number | null = null;
  let isOutsideRadius = false;
  let distanceFormatted = "";

  if (location && officeSetting) {
    distanceMeters = calculateDistanceInMeters(
      location.lat,
      location.lng,
      officeSetting.lat,
      officeSetting.lng
    );

    isOutsideRadius = distanceMeters > officeSetting.radius;

    if (distanceMeters >= 1000) {
      distanceFormatted = `${(distanceMeters / 1000).toFixed(1)} km`;
    } else {
      distanceFormatted = `${Math.round(distanceMeters)} meter`;
    }
  }

  const handleCapture = (dataUrl: string) => {
    setPhotoDataUrl(dataUrl);
    setSubmitError(null);
  };

  const handleSubmitAttendance = async () => {
    if (!photoDataUrl) {
      setSubmitError("Silakan ambil foto selfie terlebih dahulu.");
      return;
    }

    if (!location) {
      setSubmitError("Lokasi GPS belum tersedia. Pastikan izin lokasi aktif.");
      return;
    }

    if (isOutsideRadius) {
      setSubmitError(
        `Lokasi Anda berada di luar radius kantor (${distanceFormatted} dari kantor). Jarak maksimal ${officeSetting?.radius}m.`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload photo directly to R2 via presigned URL
      const folder = mode === "checkin" ? "checkin" : "checkout";
      const blob = dataUrlToBlob(photoDataUrl);
      const objectKey = await uploadToR2(blob, folder);

      if (mode === "checkin") {
        const res = await submitCheckInAction(objectKey, location.lat, location.lng);
        if (res.error) {
          setSubmitError(res.error);
          setIsSubmitting(false);
        } else {
          setSubmitSuccess(
            `Berhasil Check-In! Status: ${res.status === "telat" ? "Terlambat" : "Tepat Waktu"}`
          );
          setTimeout(() => {
            router.push("/intern");
            router.refresh();
          }, 1500);
        }
      } else {
        const res = await submitCheckOutAction(objectKey, location.lat, location.lng);
        if (res.error) {
          setSubmitError(res.error);
          setIsSubmitting(false);
        } else {
          setSubmitSuccess("Berhasil Check-Out!");
          setTimeout(() => {
            router.push("/intern");
            router.refresh();
          }, 1500);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengunggah foto.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <Link
          href="/intern"
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-[#1a1c1c]">
          {mode === "checkin" ? "Absen Masuk" : "Absen Keluar"}
        </h1>
        <div className="w-9" />
      </div>

      {/* Mode Switcher if checkin already done */}
      {!isLeaveOrSakit && todayRecord?.jamMasuk && !todayRecord?.jamKeluar && (
        <div className="flex bg-amber-50 p-1 rounded-2xl border border-amber-200/60">
          <button
            onClick={() => setMode("checkout")}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Mode Absen Keluar Active
          </button>
        </div>
      )}

      {/* Leave/Sakit Approved Message */}
      {isLeaveOrSakit && (
        <Card variant="flat" className="p-6 text-center bg-sky-50 border border-sky-100">
          <CalendarOff className="w-12 h-12 text-sky-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-sky-900 mb-1">
            Status Presensi: {todayRecord.status === "izin" ? "Izin" : "Sakit"}
          </h2>
          <p className="text-xs text-sky-700">
            Pengajuan {todayRecord.status === "izin" ? "Izin" : "Sakit"} Anda telah disetujui untuk hari ini. Anda tidak perlu melakukan presensi.
          </p>
        </Card>
      )}

      {/* Already Completed Message */}
      {!isLeaveOrSakit && todayRecord?.jamMasuk && todayRecord?.jamKeluar && (
        <Card variant="flat" className="p-6 text-center bg-emerald-50 border border-emerald-100">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-emerald-900 mb-1">
            Absensi Hari Ini Selesai
          </h2>
          <p className="text-xs text-emerald-700">
            Anda sudah melakukan check-in dan check-out untuk hari ini.
          </p>
        </Card>
      )}

      {/* Camera Capture Section */}
      {!isLeaveOrSakit && (!todayRecord?.jamMasuk || !todayRecord?.jamKeluar) && (
        <>
          {/* Real-time GPS Radius Warning Banner */}
          {isOutsideRadius && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Di Luar Radius Kantor
                </h3>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  Posisi Anda berjarak <strong className="font-bold text-rose-900">{distanceFormatted}</strong> dari kantor (Maksimal radius {officeSetting?.radius}m). Absensi tidak dapat diproses dari lokasi ini.
                </p>
              </div>
            </div>
          )}

          {/* GPS Location Status Indicator */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <MapPin className="w-4 h-4 text-[#006761]" />
              <span>
                {isGettingLocation
                  ? "Mencari lokasi GPS..."
                  : location
                  ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  : "Lokasi tidak ditemukan"}
              </span>
            </div>
            {location && (
              isOutsideRadius ? (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  🔴 {distanceFormatted} dari kantor
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  🟢 {distanceFormatted ? distanceFormatted : "Dalam Radius"}
                </span>
              )
            )}
          </div>

          {locationError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{locationError}</span>
            </div>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-800 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {/* Camera Component */}
          <CameraCapture
            onCapture={handleCapture}
            isSubmitting={isSubmitting}
            isOutsideRadius={isOutsideRadius}
          />

          {/* Submit Attendance Button */}
          {photoDataUrl && !submitSuccess && (
            <Button
              onClick={handleSubmitAttendance}
              isLoading={isSubmitting}
              disabled={isOutsideRadius || isSubmitting}
              className={`w-full py-4 text-base font-semibold mt-2 shadow-lg disabled:opacity-50 ${
                mode === "checkin"
                  ? "bg-[#006761] hover:bg-[#00524d] text-white shadow-[#006761]/20"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/25 border-none"
              }`}
            >
              {mode === "checkin" ? "Kirim Absen Masuk" : "Kirim Absen Keluar"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
