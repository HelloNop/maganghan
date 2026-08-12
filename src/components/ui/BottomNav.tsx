"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, CalendarCheck, User } from "lucide-react";
import clsx from "clsx";

export function BottomNav() {
  const pathname = usePathname();

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

  // Jika sedang berada di halaman scan wajah / absen (/intern/absen), jangan tampilkan footer navigation
  if (isAbsenActive) {
    return null;
  }

  return (
    <>
      {/* Spacer agar konten paling bawah tidak tertutup floating BottomNav */}
      <div className="h-24 shrink-0 pointer-events-none" />

      {/* Dark Eco-Teal Floating Bottom Navigation Container */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-[calc(28rem-2rem)] mx-auto">
        <nav className="bg-[#002b28]/95 backdrop-blur-2xl border border-[#006761]/40 shadow-[0_16px_36px_rgba(0,35,32,0.45)] rounded-full px-3 py-2.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname?.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className="flex flex-col items-center justify-center py-0.5 transition-all duration-200 min-w-[64px]"
              >
                <div
                  className={clsx(
                    "w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 mb-1 relative",
                    isActive
                      ? "bg-gradient-to-r from-[#00837b] to-[#006761] text-white shadow-lg shadow-[#00837b]/50 scale-105"
                      : "text-[#8ea9a5] hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-4 h-4 transition-transform duration-200",
                      isActive ? "stroke-[2.5]" : "stroke-[1.75]"
                    )}
                  />
                  {/* Neon Cyan Dot Indicator inside active badge */}
                  {isActive && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#40e0d0] shadow-[0_0_8px_#40e0d0]" />
                  )}
                </div>
                <span
                  className={clsx(
                    "text-[10px] leading-none font-semibold tracking-tight transition-colors",
                    isActive ? "text-white font-bold" : "text-[#7b9894]"
                  )}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
