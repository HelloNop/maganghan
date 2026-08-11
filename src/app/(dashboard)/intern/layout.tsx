import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTodayAttendanceAction } from "@/actions/attendance";
import { BottomNav } from "@/components/ui/BottomNav";

export const dynamic = "force-dynamic";

export default async function InternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "intern") {
    // Admin mencoba akses halaman intern — arahkan ke dashboard admin
    redirect("/admin");
  }

  // Tentukan status absensi hari ini untuk tombol BottomNav
  const todayAttendance = await getTodayAttendanceAction();

  const attendanceStatus =
    todayAttendance?.jamKeluar
      ? "checked-out"
      : todayAttendance?.jamMasuk
        ? "checked-in"
        : "none";

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-gray-200/50 border-x border-gray-100 flex flex-col">
        <main className="flex-1 p-5">{children}</main>
        <BottomNav attendanceStatus={attendanceStatus} />
      </div>
    </div>
  );
}
