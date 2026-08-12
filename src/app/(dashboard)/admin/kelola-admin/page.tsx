import React from "react";
import { auth } from "@/lib/auth";
import { getAdminUsersAction } from "@/actions/adminUser";
import { AdminUserTable } from "@/components/features/admin/AdminUserTable";

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserId = session?.user?.id || "";
  const adminUsers = await getAdminUsersAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1c1c] tracking-tight">
          Kelola Akun Administrator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tambah akun administrator baru, kelola hak akses, dan reset kata sandi admin.
        </p>
      </div>

      <AdminUserTable initialData={adminUsers} currentUserId={currentUserId} />
    </div>
  );
}
