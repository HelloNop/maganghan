"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/features/CameraCapture";
import {
  submitCheckInAction,
  submitCheckOutAction,
  getTodayAttendanceAction,
} from "@/actions/attendance";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, MapPin, CheckCircle2, AlertTriangle, LogIn, LogOut } from "lucide-react";
import Link from "next/link";

export default function AbsenPage() {
  const router = useRouter();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(true);

  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [mode, setMode] = useState<"checkin" | "checkout">("checkin");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Fetch initial today's attendance status
  useEffect(() => {
    async function loadStatus() {
      const record = await getTodayAttendanceAction();
      setTodayRecord(record);
      if (record?.jamMasuk && !record?.jamKeluar) {
        setMode("checkout");
      }
    }
    loadStatus();
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
        setLocationError("Gagal mendapatkan lokasi GPS. Pastikan GPS/Lokasi diizinkan.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

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

    setIsSubmitting(true);
    setSubmitError(null);

    if (mode === "checkin") {
      const res = await submitCheckInAction(photoDataUrl, location.lat, location.lng);
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
      const res = await submitCheckOutAction(photoDataUrl, location.lat, location.lng);
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
      {todayRecord?.jamMasuk && !todayRecord?.jamKeluar && (
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setMode("checkout")}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#006761] text-white shadow-sm flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Check-Out Saja
          </button>
        </div>
      )}

      {/* Already Completed Message */}
      {todayRecord?.jamMasuk && todayRecord?.jamKeluar && (
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
      {(!todayRecord?.jamMasuk || !todayRecord?.jamKeluar) && (
        <>
          {/* GPS Location Status Indicator */}
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
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
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                GPS Aktif
              </span>
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
          />

          {/* Submit Attendance Button */}
          {photoDataUrl && !submitSuccess && (
            <Button
              onClick={handleSubmitAttendance}
              isLoading={isSubmitting}
              className="w-full py-4 text-base font-semibold mt-2 shadow-lg shadow-[#006761]/20"
            >
              {mode === "checkin" ? "Kirim Absen Masuk" : "Kirim Absen Keluar"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
