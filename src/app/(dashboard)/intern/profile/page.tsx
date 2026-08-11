import React from "react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  LogOut,
  Bell,
  Globe,
  HelpCircle,
  Shield,
} from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const userName = session?.user?.name || "Anak Magang";
  const userEmail = session?.user?.email || "intern@magang.local";
  const userRole = session?.user?.role || "intern";

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#006761] uppercase tracking-wider">
          Green Attendance
        </span>
        <button className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Avatar & User Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006761] to-[#00837b] text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-[#006761]/20 border-4 border-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <h1 className="text-xl font-bold text-[#1a1c1c]">{userName}</h1>
        <p className="text-xs text-[#6d7a78] mt-0.5 capitalize">
          Magang • {userRole}
        </p>
      </div>

      {/* Personal Information Card */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Informasi Pribadi
        </h2>
        <Card variant="default" className="p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#006761] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                EMAIL
              </span>
              <span className="text-sm font-semibold text-[#1a1c1c]">
                {userEmail}
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#006761] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                DIVISI / UNIT KERJA
              </span>
              <span className="text-sm font-semibold text-[#1a1c1c]">
                Divisi IT (Default)
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#006761] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                POSISI
              </span>
              <span className="text-sm font-semibold text-[#1a1c1c]">
                Frontend Developer Intern
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Support & Account Action */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Pengaturan & Sesi
        </h2>
        <Card variant="default" className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2.5 text-gray-700 font-medium">
              <Globe className="w-4 h-4 text-gray-400" />
              <span>Bahasa</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Bahasa Indonesia
            </span>
          </div>

          <div className="w-full h-px bg-gray-100" />

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="danger"
              className="w-full py-3 text-sm font-semibold mt-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar Sesi
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
