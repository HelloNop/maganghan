import React from "react";
import { getLeaveRequestsAction } from "@/actions/leaveRequest";
import { getAppSetting } from "@/lib/db/settings";
import { LeaveRequestForm } from "@/components/features/LeaveRequestForm";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { FileText, Bell } from "lucide-react";

export default async function IzinPage() {
  const [leaveList, instansiNameSetting] = await Promise.all([
    getLeaveRequestsAction(),
    getAppSetting("nama_instansi"),
  ]);

  const instansiName = instansiNameSetting || "Maganghan";

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#006761] uppercase tracking-wider">
            {instansiName}
          </span>
          <h1 className="text-xl font-bold text-[#1a1c1c] tracking-tight">
            Pengajuan Izin
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#006761] transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Form Component */}
      <LeaveRequestForm />

      {/* History of Leave Requests (Pre-rendered on Server - No Layout Shift) */}
      <div>
        <h2 className="text-base font-bold text-[#1a1c1c] mb-3">
          Riwayat Pengajuan Izin
        </h2>

        {leaveList.length === 0 ? (
          <Card variant="flat" className="p-6 text-center text-xs text-gray-500">
            Belum ada riwayat pengajuan izin.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {leaveList.map((item) => (
              <Card key={item.id} variant="default" className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1a1c1c] capitalize">
                    {item.jenis} ({item.tanggalMulai} s/d {item.tanggalSelesai})
                  </span>
                  <StatusChip status={item.statusApproval} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.keterangan}
                </p>
                {item.fileSuratUrl && (
                  <a
                    href={item.fileSuratUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#006761] hover:underline mt-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lihat Lampiran Surat
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
