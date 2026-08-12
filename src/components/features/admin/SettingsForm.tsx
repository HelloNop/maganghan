"use client";

import React, { useState } from "react";
import { AppSettingsForm, updateAppSettingsAction } from "@/actions/settings";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdminReminderButton } from "./AdminReminderButton";
import {
  MapPin,
  Clock,
  Building,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: AppSettingsForm;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [form, setForm] = useState<AppSettingsForm>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (key: keyof AppSettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        handleChange("officeLat", position.coords.latitude.toFixed(6));
        handleChange("officeLng", position.coords.longitude.toFixed(6));
      },
      (error) => {
        setIsLocating(false);
        alert(`Gagal mengambil lokasi: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const res = await updateAppSettingsAction(form);
    setIsLoading(false);

    if (res?.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({
        type: "success",
        text: "Pengaturan sistem berhasil disimpan!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Identitas Instansi */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Building className="w-5 h-5 text-[#006761]" />
          <h2 className="text-base font-bold text-[#1a1c1c]">
            Identitas Instansi
          </h2>
        </div>

        <Input
          label="Nama Instansi *"
          placeholder="Misal: PT Green Tekno Indonesia"
          value={form.namaInstansi}
          onChange={(e) => handleChange("namaInstansi", e.target.value)}
          required
        />
      </Card>

      {/* Pengaturan Jam Kerja */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Clock className="w-5 h-5 text-[#006761]" />
          <h2 className="text-base font-bold text-[#1a1c1c]">
            Jam Kerja & Toleransi Absen
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Jam Batas Masuk (Tepat Waktu) *"
            type="time"
            value={form.jamMasuk}
            onChange={(e) => handleChange("jamMasuk", e.target.value)}
            helperText="Absen masuk setelah jam ini dianggap Terlambat"
            required
          />

          <Input
            label="Jam Minimal Pulang (Check-Out) *"
            type="time"
            value={form.jamKeluar}
            onChange={(e) => handleChange("jamKeluar", e.target.value)}
            helperText="Jam standar selesai magang"
            required
          />
        </div>
      </Card>

      {/* Pengaturan Geolocation & Radius GPS */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#006761]" />
            <h2 className="text-base font-bold text-[#1a1c1c]">
              Validasi Lokasi GPS Kantor
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            isLoading={isLocating}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Gunakan GPS Saya Saat Ini</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latitude Kantor *"
            placeholder="-6.2088"
            value={form.officeLat}
            onChange={(e) => handleChange("officeLat", e.target.value)}
            helperText="Koordinat Latitude lokasi kantor"
          />

          <Input
            label="Longitude Kantor *"
            placeholder="106.8456"
            value={form.officeLng}
            onChange={(e) => handleChange("officeLng", e.target.value)}
            helperText="Koordinat Longitude lokasi kantor"
          />
        </div>

        <Input
          label="Radius Toleransi GPS (Meter) *"
          type="number"
          placeholder="100"
          value={form.officeRadiusM}
          onChange={(e) => handleChange("officeRadiusM", e.target.value)}
          helperText="Jarak maksimal dalam meter yang diperbolehkan saat anak magang melakukan check-in/out"
          required
        />
      </Card>

      {/* Push Notification Broadcast Reminder Card */}
      <AdminReminderButton />

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" isLoading={isLoading}>
          Simpan Semua Pengaturan
        </Button>
      </div>
    </form>
  );
}
