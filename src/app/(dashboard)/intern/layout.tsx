import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c]">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl shadow-gray-200/50 border-x border-gray-100 flex flex-col">
        <main className="flex-1 p-5">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
