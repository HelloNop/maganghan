import React from "react";
import clsx from "clsx";

export type StatusType =
  | "hadir"
  | "telat"
  | "alpha"
  | "izin"
  | "sakit"
  | "pending"
  | "approved"
  | "rejected";

interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export function StatusChip({ status, label, className }: StatusChipProps) {
  const normalized = status.toLowerCase();

  const styles: Record<string, { bg: string; text: string; defaultLabel: string }> = {
    hadir: {
      bg: "bg-emerald-50 border border-emerald-200/60",
      text: "text-emerald-700",
      defaultLabel: "Tepat Waktu",
    },
    telat: {
      bg: "bg-amber-50 border border-amber-200/60",
      text: "text-amber-700",
      defaultLabel: "Terlambat",
    },
    alpha: {
      bg: "bg-rose-50 border border-rose-200/60",
      text: "text-rose-700",
      defaultLabel: "Alpha",
    },
    izin: {
      bg: "bg-sky-50 border border-sky-200/60",
      text: "text-sky-700",
      defaultLabel: "Izin",
    },
    sakit: {
      bg: "bg-purple-50 border border-purple-200/60",
      text: "text-purple-700",
      defaultLabel: "Sakit",
    },
    pending: {
      bg: "bg-amber-50 border border-amber-200/60",
      text: "text-amber-700",
      defaultLabel: "Menunggu Approval",
    },
    approved: {
      bg: "bg-emerald-50 border border-emerald-200/60",
      text: "text-emerald-700",
      defaultLabel: "Disetujui",
    },
    rejected: {
      bg: "bg-rose-50 border border-rose-200/60",
      text: "text-rose-700",
      defaultLabel: "Ditolak",
    },
  };

  const currentStyle = styles[normalized] || {
    bg: "bg-gray-100 border border-gray-200",
    text: "text-gray-700",
    defaultLabel: status,
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full tracking-wide",
        currentStyle.bg,
        currentStyle.text,
        className
      )}
    >
      {label || currentStyle.defaultLabel}
    </span>
  );
}
