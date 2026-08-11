import React from "react";
import { getLeaveRequestsForAdminAction } from "@/actions/approval";
import { ApprovalTable } from "@/components/features/admin/ApprovalTable";

export default async function AdminApprovalPage() {
  const requests = await getLeaveRequestsForAdminAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Approval Pengajuan Izin / Sakit
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review dan proses pengajuan izin atau sakit anak magang.
        </p>
      </div>

      <ApprovalTable initialData={requests} />
    </div>
  );
}
