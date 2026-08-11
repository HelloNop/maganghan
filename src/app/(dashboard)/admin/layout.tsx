import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAppSetting } from "@/lib/db/settings";
import { AdminSidebar } from "@/components/ui/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const instansiName = (await getAppSetting("nama_instansi")) || "Green Attendance";

  return (
    <div className="min-h-screen bg-[#f4f6f6]">
      <AdminSidebar
        userName={session.user.name || "Admin"}
        instansiName={instansiName}
      />
      <main className="ml-[260px] min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
