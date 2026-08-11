import React from "react";
import { BottomNav } from "@/components/ui/BottomNav";

export const dynamic = "force-dynamic";

export default function InternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] pb-24">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-gray-200/50 border-x border-gray-100 flex flex-col">
        <main className="flex-1 p-5">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
