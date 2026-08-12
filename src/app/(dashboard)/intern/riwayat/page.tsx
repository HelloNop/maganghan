import React from "react";
import { getAttendanceHistoryAction } from "@/actions/leaveRequest";
import { getAppSetting } from "@/lib/db/settings";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { Calendar, Bell } from "lucide-react";

export default async function RiwayatPage() {
  const [historyList, instansiNameSetting] = await Promise.all([
    getAttendanceHistoryAction(),
    getAppSetting("nama_instansi"),
  ]);

  const instansiName = instansiNameSetting || "Maganghan";

  function calculateWorkHours(jamMasuk: Date | null, jamKeluar: Date | null): string {
    if (!jamMasuk || !jamKeluar) return "--";
    const diffMs = new Date(jamKeluar).getTime() - new Date(jamMasuk).getTime();
    if (diffMs <= 0) return "0h 0m";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }

  function formatDateIndonesian(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#006761] uppercase tracking-wider">
            {instansiName}
          </span>
          <h1 className="text-xl font-bold text-[#1a1c1c] tracking-tight">
            Riwayat Kehadiran
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#006761] transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Attendance History List */}
      {historyList.length === 0 ? (
        <Card variant="flat" className="p-8 text-center flex flex-col items-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-600">
            Belum ada catatan kehadiran
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Riwayat absensi harian Anda akan tampil di sini.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {historyList.map((item) => {
            const jamMasukStr = item.jamMasuk
              ? new Date(item.jamMasuk).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--";

            const jamKeluarStr = item.jamKeluar
              ? new Date(item.jamKeluar).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--";

            const totalJam = calculateWorkHours(item.jamMasuk, item.jamKeluar);

            return (
              <Card key={item.id} variant="default" className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-base font-bold text-[#1a1c1c]">
                    {formatDateIndonesian(item.tanggal)}
                  </span>
                  <StatusChip status={item.status} />
                </div>

                <div className="grid grid-cols-2 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                      CLOCK IN
                    </span>
                    <span className="text-sm font-bold text-[#1a1c1c]">
                      {jamMasukStr}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                      CLOCK OUT
                    </span>
                    <span className="text-sm font-bold text-[#1a1c1c]">
                      {jamKeluarStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-50">
                  <span className="text-gray-500 font-medium">Total Jam Kerja</span>
                  <span className="font-bold text-[#006761]">{totalJam}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
