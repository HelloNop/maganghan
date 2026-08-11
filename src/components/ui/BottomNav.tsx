"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, CalendarCheck, User, LogIn, LogOut } from "lucide-react";
import clsx from "clsx";

type AttendanceStatus = "none" | "checked-in" | "checked-out";

interface BottomNavProps {
  attendanceStatus?: AttendanceStatus;
}

export function BottomNav({ attendanceStatus = "none" }: BottomNavProps) {
  const pathname = usePathname();

  const isCheckedIn = attendanceStatus === "checked-in";
  const isCheckedOut = attendanceStatus === "checked-out";
  const isAbsenActive = pathname?.startsWith("/intern/absen");

  const tabs = [
    {
      name: "Beranda",
      href: "/intern",
      icon: Home,
      exact: true,
    },
    {
      name: "Riwayat",
      href: "/intern/riwayat",
      icon: History,
      exact: false,
    },
    {
      name: "Izin",
      href: "/intern/izin",
      icon: CalendarCheck,
      exact: false,
    },
    {
      name: "Profile",
      href: "/intern/profile",
      icon: User,
      exact: false,
    },
  ];

  // Label & icon berdasarkan status absensi
  const actionLabel = isCheckedOut
    ? "Selesai"
    : isCheckedIn
      ? "Absen Pulang"
      : "Absen Masuk";

  const ActionIcon = isCheckedIn && !isCheckedOut ? LogOut : LogIn;

  // Warna tombol berdasarkan status
  const actionBg = isCheckedOut
    ? "bg-gray-400 shadow-gray-300/40"
    : isCheckedIn
      ? "bg-amber-500 shadow-amber-400/40"
      : "bg-[#006761] shadow-[#006761]/30";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-2 max-w-md mx-auto shadow-lg rounded-t-3xl">
      <nav className="flex items-center justify-around relative">
        {/* Tabs kiri: Beranda & Riwayat */}
        {tabs.slice(0, 2).map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1 px-3 min-w-[60px] transition-colors duration-150 rounded-xl",
                isActive
                  ? "text-[#006761] font-semibold"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5 mb-0.5 transition-transform duration-150",
                  isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                )}
              />
              <span className="text-[11px] leading-tight">{tab.name}</span>
            </Link>
          );
        })}

        {/* Tombol Absen Tengah */}
        <Link
          href={isCheckedOut ? "#" : "/intern/absen"}
          aria-disabled={isCheckedOut}
          className="relative -top-5 flex flex-col items-center gap-1 group"
          onClick={(e) => isCheckedOut && e.preventDefault()}
        >
          <div
            className={clsx(
              "w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-200 border-4 border-white",
              actionBg,
              isCheckedOut
                ? "cursor-not-allowed opacity-70"
                : "group-hover:scale-105 active:scale-95",
              isAbsenActive && !isCheckedOut && "ring-2 ring-offset-2",
              isCheckedIn && !isCheckedOut && "ring-amber-400",
              !isCheckedIn && !isCheckedOut && "ring-[#006761]"
            )}
          >
            <ActionIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span
            className={clsx(
              "text-[10px] font-semibold leading-tight -mt-0.5",
              isCheckedOut
                ? "text-gray-400"
                : isCheckedIn
                  ? "text-amber-500"
                  : "text-[#006761]"
            )}
          >
            {actionLabel}
          </span>
        </Link>

        {/* Tabs kanan: Izin & Profile */}
        {tabs.slice(2).map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1 px-3 min-w-[60px] transition-colors duration-150 rounded-xl",
                isActive
                  ? "text-[#006761] font-semibold"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5 mb-0.5 transition-transform duration-150",
                  isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                )}
              />
              <span className="text-[11px] leading-tight">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
