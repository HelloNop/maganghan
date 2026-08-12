"use client";

import React, { useState } from "react";
import { sendAttendanceReminderPushAction } from "@/actions/pushNotification";
import { Button } from "@/components/ui/Button";
import { BellRing, CheckCircle2, AlertCircle } from "lucide-react";

export function AdminReminderButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSendReminder = async () => {
    setResult(null);
    setIsLoading(true);

    const res = await sendAttendanceReminderPushAction();
    setIsLoading(false);

    if (res.error) {
      setResult({ type: "error", text: res.error });
    } else {
      setResult({
        type: "success",
        text: res.message || "Notifikasi pengingat presensi berhasil dikirim!",
      });
    }
  };

  return (
    <div className="p-5 bg-[#006761]/5 border border-[#006761]/15 rounded-2xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#1a1c1c] flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#006761]" />
            Pengingat Presensi Masuk (Push Notification)
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            Kirim push notification instan ke HP / laptop anak magang aktif yang belum melakukan presensi hari ini.
          </p>
        </div>

        <Button
          onClick={handleSendReminder}
          isLoading={isLoading}
          size="sm"
          className="shrink-0"
        >
          Kirim Pengingat Sekarang
        </Button>
      </div>

      {result && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            result.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
              : "bg-rose-50 text-rose-800 border border-rose-100"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{result.text}</span>
        </div>
      )}
    </div>
  );
}
