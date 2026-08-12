"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  UserCog,
  User,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Anak Magang", href: "/admin/anak-magang", icon: Users },
  { name: "Unit Kerja", href: "/admin/unit-kerja", icon: Building2 },
  { name: "Posisi", href: "/admin/posisi", icon: Briefcase },
  { name: "Approval Izin", href: "/admin/approval", icon: ClipboardCheck },
  { name: "Rekap Absensi", href: "/admin/rekap", icon: BarChart3 },
  { name: "Kelola Admin", href: "/admin/kelola-admin", icon: UserCog },
  { name: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

interface AdminSidebarProps {
  userName: string;
  instansiName: string;
}

export function AdminSidebar({ userName, instansiName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0a1f1e] flex flex-col z-30">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006761] to-[#00837b] flex items-center justify-center shadow-lg shadow-[#006761]/30">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              {instansiName}
            </h1>
            <p className="text-[11px] text-[#5a8a87] font-medium">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3d6361]">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#006761] text-white shadow-md shadow-[#006761]/20"
                  : "text-[#8aadab] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={clsx(
                  "w-[18px] h-[18px] transition-colors",
                  isActive
                    ? "text-white"
                    : "text-[#5a8a87] group-hover:text-white"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <Link
          href="/admin/profile"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group",
            pathname === "/admin/profile"
              ? "bg-[#006761]/20 text-white border border-[#006761]/40"
              : "hover:bg-white/5 text-[#8aadab] hover:text-white"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#006761]/40 flex items-center justify-center text-xs font-bold text-[#96efe6] shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-white">
              {userName}
            </p>
            <p className="text-[11px] text-[#5a8a87]">Profil Saya</p>
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#8aadab] hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
