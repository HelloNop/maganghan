import React from "react";
import { auth } from "@/lib/auth";
import { getTodayAttendanceAction } from "@/actions/attendance";
import { getLeaveRequestsAction } from "@/actions/leaveRequest";
import { getAppSetting } from "@/lib/db/settings";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { RealtimeClock } from "@/components/ui/RealtimeClock";
import { PushNotificationToggle } from "@/components/ui/PushNotificationToggle";
import { Bell, LogIn, LogOut, Camera, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function InternDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Anak Magang";

  const [todayAttendance, leaveRequests, instansiNameSetting] = await Promise.all([
    getTodayAttendanceAction(),
    getLeaveRequestsAction(),
    getAppSetting("nama_instansi"),
  ]);

  const instansiName = instansiNameSetting || "Green Attendance";

  const totalLeaveRequests = leaveRequests.length;
  const approvedLeaveRequests = leaveRequests.filter(
    (req) => req.statusApproval === "approved"
  ).length;
  const rejectedLeaveRequests = leaveRequests.filter(
    (req) => req.statusApproval === "rejected"
  ).length;

  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const dateFormatted = now.toLocaleDateString("id-ID", options);

  const jamMasukStr = todayAttendance?.jamMasuk
    ? new Date(todayAttendance.jamMasuk).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-- : --";

  const jamKeluarStr = todayAttendance?.jamKeluar
    ? new Date(todayAttendance.jamKeluar).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-- : --";

  const isCheckedIn = !!todayAttendance?.jamMasuk;
  const isCheckedOut = !!todayAttendance?.jamKeluar;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#006761] uppercase tracking-wider">
            {instansiName}
          </span>
          <h1 className="text-xl font-bold text-[#1a1c1c] tracking-tight">
            Selamat Datang, {userName}
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#006761] transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Today's Summary Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1a1c1c]">
            Ringkasan Kehadiran Hari Ini
          </h2>
          {isCheckedOut ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
            </span>
          ) : isCheckedIn ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-full">
              Sudah Absen Masuk
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 text-[#006761] rounded-full">
              Belum Absen
            </span>
          )}
        </div>

        <Card variant="elevated" className="flex flex-col items-center py-6 px-4 text-center">
          <RealtimeClock />
          <p className="text-xs text-gray-500 font-medium capitalize mb-5">
            {dateFormatted}
          </p>

          <div className="w-full h-px bg-gray-100 mb-5" />

          <div className="grid grid-cols-2 w-full">
            <div className="flex flex-col items-center border-r border-gray-100 px-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                <LogIn className="w-3.5 h-3.5 text-[#006761]" />
                <span>Jam Masuk</span>
              </div>
              <span className="text-base font-bold text-[#1a1c1c]">
                {jamMasukStr}
              </span>
              {todayAttendance?.status && (
                <div className="mt-1.5">
                  <StatusChip status={todayAttendance.status} />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center px-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
                <LogOut className="w-3.5 h-3.5 text-amber-600" />
                <span>Jam Keluar</span>
              </div>
              <span className="text-base font-bold text-[#1a1c1c]">
                {jamKeluarStr}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Direct Quick Action Banner */}
      {!isCheckedOut && (
        <Link href="/intern/absen" className="group block">
          <Card
            variant="accent"
            className="p-5 flex items-center justify-between group-hover:shadow-xl group-hover:shadow-[#006761]/30 transition-all duration-200"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {isCheckedIn ? "Absen Keluar Sekarang" : "Absen Masuk Sekarang"}
                </h3>
                <p className="text-xs text-teal-100/90 mt-0.5">
                  Klik untuk melakukan scan wajah & lokasi GPS
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Card>
        </Link>
      )}

      {/* Push Notification Setting */}
      <PushNotificationToggle />

      {/* Request Status Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1a1c1c]">Status Pengajuan Izin</h2>
          <Link
            href="/intern/izin"
            className="text-xs font-semibold text-[#006761] hover:underline"
          >
            + Ajukan Izin
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card variant="flat" className="p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-[#006761]">
              {totalLeaveRequests}
            </span>
            <span className="text-xs text-gray-500 font-medium mt-1">
              Pengajuan
            </span>
          </Card>

          <Card variant="flat" className="p-4 flex flex-col items-center text-center font-medium">
            <span className="text-2xl font-bold text-emerald-600">
              {approvedLeaveRequests}
            </span>
            <span className="text-xs text-gray-500 font-medium mt-1">
              Disetujui
            </span>
          </Card>

          <Card variant="flat" className="p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-rose-600">
              {rejectedLeaveRequests}
            </span>
            <span className="text-xs text-gray-500 font-medium mt-1">
              Ditolak
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}
