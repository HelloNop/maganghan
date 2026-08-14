import React from "react";
import { AutoRefresh } from "@/components/ui/AutoRefresh";
import {
  getDashboardStatsAction,
  getWeeklyAttendanceAction,
  getRecentPendingApprovalsAction,
  getTodayAttendanceAuditAction,
} from "@/actions/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { TodayPhotoAuditFeed } from "@/components/features/admin/TodayPhotoAuditFeed";
import {
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [stats, weeklyData, pendingApprovals, todayAuditData] = await Promise.all([
    getDashboardStatsAction(),
    getWeeklyAttendanceAction(),
    getRecentPendingApprovalsAction(),
    getTodayAttendanceAuditAction(),
  ]);

  const maxWeeklyCount = Math.max(
    ...weeklyData.map((d) => d.hadir + d.telat + d.alpha),
    1
  );

  return (
    <div className="space-y-8">
      <AutoRefresh intervalMs={30000} />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan kehadiran anak magang dan pengajuan hari ini.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total & Active Interns */}
        <Card variant="default" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#006761]/10 flex items-center justify-center text-[#006761]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Anak Magang Aktif
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#1a1c1c]">
                {stats.activeInterns}
              </span>
              <span className="text-xs text-gray-400">
                / {stats.totalInterns} total
              </span>
            </div>
          </div>
        </Card>

        {/* Today Present */}
        <Card variant="default" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hadir Hari Ini
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">
                {stats.todayPresent}
              </span>
              <span className="text-xs text-gray-400">tepat waktu</span>
            </div>
          </div>
        </Card>

        {/* Today Late */}
        <Card variant="default" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Terlambat Hari Ini
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-600">
                {stats.todayLate}
              </span>
              <span className="text-xs text-gray-400">anak magang</span>
            </div>
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card variant="default" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pending Approval
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-sky-600">
                {stats.pendingApprovals}
              </span>
              <span className="text-xs text-gray-400">pengajuan</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid: Chart + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend Chart */}
        <Card variant="default" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#006761]" />
                <h2 className="text-base font-bold text-[#1a1c1c]">
                  Tren Kehadiran 7 Hari Terakhir
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Hadir
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Telat
                </span>
              </div>
            </div>

            {/* CSS Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-gray-100">
              {weeklyData.map((d, idx) => {
                const total = d.hadir + d.telat;
                const heightPercent = Math.round((total / maxWeeklyCount) * 100);
                const hadirHeight = total > 0 ? Math.round((d.hadir / total) * 100) : 0;
                const telatHeight = total > 0 ? Math.round((d.telat / total) * 100) : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {total}
                    </div>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg overflow-hidden bg-gray-100 flex flex-col justify-end transition-all duration-300 group-hover:scale-105"
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    >
                      {d.telat > 0 && (
                        <div
                          className="w-full bg-amber-500 transition-all"
                          style={{ height: `${telatHeight}%` }}
                        />
                      )}
                      {d.hadir > 0 && (
                        <div
                          className="w-full bg-emerald-500 transition-all"
                          style={{ height: `${hadirHeight}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-1">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
            <span>Menampilkan data absensi seminggu terakhir</span>
            <Link
              href="/admin/rekap"
              className="text-[#006761] font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Rekap Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Pending Approvals Widget */}
        <Card variant="default" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1a1c1c]">
                Pengajuan Perlu Approval
              </h2>
              {stats.pendingApprovals > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                  {stats.pendingApprovals}
                </span>
              )}
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#006761]" />
                Tidak ada pengajuan pending
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[#f9fafa] rounded-xl border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1a1c1c]">
                        {req.userName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {req.keterangan}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {req.tanggalMulai} s/d {req.tanggalSelesai}
                      </span>
                    </div>
                    <StatusChip status={req.jenis} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link href="/admin/approval" className="block">
              <Button variant="outline" className="w-full text-xs">
                Kelola Semua Approval
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Audit Foto Selfie Presensi Hari Ini Section */}
      <TodayPhotoAuditFeed initialData={todayAuditData} />
    </div>
  );
}
