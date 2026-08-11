import React from "react";
import { auth } from "@/lib/auth";
import { getTodayAttendanceAction } from "@/actions/attendance";
import { getLeaveRequestsAction } from "@/actions/leaveRequest";
import { getAppSetting } from "@/lib/db/settings";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { RealtimeClock } from "@/components/ui/RealtimeClock";
import { Bell, Clock, LogIn, LogOut, FileText } from "lucide-react";

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
        <h2 className="text-lg font-bold text-[#1a1c1c] mb-3">
          Today's Summary
        </h2>
        <Card variant="elevated" className="flex flex-col items-center py-6 text-center">
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
                <div className="mt-1">
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

      {/* Request Status Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#1a1c1c]">Request Status</h2>
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

          <Card variant="flat" className="p-4 flex flex-col items-center text-center">
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
