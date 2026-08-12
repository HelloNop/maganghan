import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maganghan - Sistem Absensi Anak Magang",
  description: "Sistem absensi digital modern dan efisien untuk anak magang.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

import { Suspense } from "react";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-[#f9f9f9] text-[#1a1c1c] antialiased selection:bg-[#006761]/20">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
