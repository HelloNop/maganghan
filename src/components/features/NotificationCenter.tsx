"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export interface NotificationItem {
  id: string;
  type:
    | "approval_approved"
    | "approval_rejected"
    | "approval_pending"
    | "attendance_reminder"
    | "attendance_done";
  title: string;
  message: string;
  time: string;
  read?: boolean;
  link?: string;
}

interface NotificationCenterProps {
  todayAttendance: any;
  leaveRequests: any[];
}

export function NotificationCenter({
  todayAttendance,
  leaveRequests,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("read_notification_ids");
      if (saved) {
        setReadIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error("Error reading notification storage:", e);
    }
  }, []);

  // Build dynamic notifications from attendance and leave requests
  useEffect(() => {
    const list: NotificationItem[] = [];

    // 1. Today Attendance Notification
    if (todayAttendance?.status === "izin" || todayAttendance?.status === "sakit") {
      list.push({
        id: `att-today-${todayAttendance.tanggal || "leave"}`,
        type: "approval_approved",
        title: `Status Presensi: ${todayAttendance.status.toUpperCase()}`,
        message: `Pengajuan ${todayAttendance.status} Anda telah disetujui untuk hari ini. Presensi dinonaktifkan.`,
        time: "Hari Ini",
        link: "/intern/absen",
      });
    } else if (todayAttendance?.jamMasuk && todayAttendance?.jamKeluar) {
      list.push({
        id: `att-today-done-${todayAttendance.tanggal}`,
        type: "attendance_done",
        title: "Presensi Hari Ini Selesai",
        message: "Anda sudah berhasil melakukan check-in dan check-out untuk hari ini.",
        time: "Hari Ini",
        link: "/intern/absen",
      });
    } else if (todayAttendance?.jamMasuk) {
      list.push({
        id: `att-today-in-${todayAttendance.tanggal}`,
        type: "attendance_done",
        title: "Absen Masuk Berhasil",
        message: "Absen masuk telah tercatat. Jangan lupa untuk melakukan absen keluar saat selesai jam kerja.",
        time: "Hari Ini",
        link: "/intern/absen",
      });
    } else {
      list.push({
        id: `att-today-remind-${new Date().toISOString().split("T")[0]}`,
        type: "attendance_reminder",
        title: "⏰ Pengingat Presensi Masuk",
        message: "Anda belum melakukan presensi hari ini. Silakan klik di sini untuk absen.",
        time: "Hari Ini",
        link: "/intern/absen",
      });
    }

    // 2. Leave Request Approval Notifications
    if (leaveRequests && leaveRequests.length > 0) {
      leaveRequests.slice(0, 5).forEach((req) => {
        const jenisLabel = req.jenis === "sakit" ? "Sakit" : "Izin";
        const dateRangeStr = `${req.tanggalMulai} s.d. ${req.tanggalSelesai}`;

        if (req.statusApproval === "approved") {
          list.push({
            id: `leave-${req.id}`,
            type: "approval_approved",
            title: `Pengajuan ${jenisLabel} Disetujui`,
            message: `Pengajuan ${jenisLabel} Anda untuk tanggal ${dateRangeStr} telah DISETUJUI oleh Admin.`,
            time: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })
              : "Baru saja",
            link: "/intern/izin",
          });
        } else if (req.statusApproval === "rejected") {
          list.push({
            id: `leave-${req.id}`,
            type: "approval_rejected",
            title: `Pengajuan ${jenisLabel} Ditolak`,
            message: `Pengajuan ${jenisLabel} Anda untuk tanggal ${dateRangeStr} DITOLAK oleh Admin.`,
            time: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })
              : "Baru saja",
            link: "/intern/izin",
          });
        } else {
          list.push({
            id: `leave-${req.id}`,
            type: "approval_pending",
            title: `Pengajuan ${jenisLabel} Menunggu`,
            message: `Pengajuan ${jenisLabel} Anda (${dateRangeStr}) sedang ditinjau oleh Admin.`,
            time: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })
              : "Baru saja",
            link: "/intern/izin",
          });
        }
      });
    }

    setNotifications(list);
  }, [todayAttendance, leaveRequests]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem("read_notification_ids", JSON.stringify(Array.from(allIds)));
    } catch (e) {
      console.error("Error saving read notification ids:", e);
    }
  };

  const toggleOpen = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "approval_approved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "approval_rejected":
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case "approval_pending":
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case "attendance_reminder":
        return <Clock className="w-4 h-4 text-[#006761]" />;
      case "attendance_done":
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#006761] hover:border-[#006761]/30 transition-all duration-200"
        title="Pusat Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#006761]" />
              <h3 className="text-sm font-bold text-[#1a1c1c]">Pusat Notifikasi</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                Belum ada notifikasi terbaru.
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={item.link || "#"}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 hover:bg-gray-50/80 transition-colors ${
                      !isRead ? "bg-teal-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-gray-100/70 shrink-0 mt-0.5">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-[#1a1c1c] truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
            <Link
              href="/intern/riwayat"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#006761] hover:underline"
            >
              Lihat Semua Riwayat Presensi & Izin &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
