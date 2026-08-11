"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, CalendarCheck, User, Camera } from "lucide-react";
import clsx from "clsx";

export function BottomNav() {
  const pathname = usePathname();

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
      name: "Absen",
      href: "/intern/absen",
      icon: Camera,
      isAction: true,
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-2 max-w-md mx-auto shadow-lg rounded-t-3xl">
      <nav className="flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);

          if (tab.isAction) {
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div
                  className={clsx(
                    "w-14 h-14 rounded-full bg-[#006761] text-white flex items-center justify-center shadow-lg shadow-[#006761]/30 transition-transform duration-200 group-hover:scale-105 active:scale-95 border-4 border-white",
                    isActive && "ring-2 ring-[#006761] ring-offset-2"
                  )}
                >
                  <tab.icon className="w-6 h-6 stroke-[2.5]" />
                </div>
              </Link>
            );
          }

          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1 px-3 min-w-[64px] transition-colors duration-150 rounded-xl",
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
