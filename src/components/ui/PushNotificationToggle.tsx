"use client";

import React, { useState, useEffect } from "react";
import {
  getVapidPublicKeyAction,
  subscribePushNotificationAction,
  sendTestPushNotificationAction,
} from "@/actions/pushNotification";
import { Button } from "@/components/ui/Button";
import { Bell, BellOff, CheckCircle2, AlertCircle, Send } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);

      // Register service worker
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
        });
      }).catch((err) => {
        console.error("SW Registration failed:", err);
      });
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleTogglePush = async () => {
    setMessage(null);

    if (!isSupported) {
      setMessage({ type: "error", text: "Browser ini tidak mendukung Web Push Notification." });
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        setMessage({ type: "success", text: "Notifikasi pengingat berhasil dinonaktifkan." });
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setMessage({
            type: "error",
            text: "Izin notifikasi ditolak oleh browser. Silakan aktifkan izin notifikasi pada pengaturan browser Anda.",
          });
          setIsLoading(false);
          return;
        }

        const vapidPublicKey = await getVapidPublicKeyAction();
        const reg = await navigator.serviceWorker.ready;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const subJson = sub.toJSON();

        if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
          const res = await subscribePushNotificationAction({
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys.p256dh,
              auth: subJson.keys.auth,
            },
          });

          if (res.error) {
            setMessage({ type: "error", text: res.error });
          } else {
            setIsSubscribed(true);
            setMessage({ type: "success", text: "Notifikasi pengingat presensi berhasil diaktifkan!" });
          }
        } else {
          setMessage({ type: "error", text: "Gagal memproses kunci langganan notifikasi." });
        }
      }
    } catch (err) {
      console.error("Push toggle error:", err);
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengkonfigurasi notifikasi." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    setMessage(null);
    setIsTesting(true);

    const res = await sendTestPushNotificationAction();
    setIsTesting(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Notifikasi uji coba terkirim ke perangkat Anda!" });
    }
  };

  if (isSupported === false) {
    return (
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Browser ini tidak mendukung notifikasi push otomatis.</span>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isSubscribed
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1a1c1c]">
              Notifikasi Pengingat Absensi
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Terima notifikasi pengingat otomatis di layar HP / Laptop Anda saat durasi presensi tiba.
            </p>
          </div>
        </div>

        <Button
          variant={isSubscribed ? "outline" : "primary"}
          onClick={handleTogglePush}
          isLoading={isLoading}
          size="sm"
        >
          {isSubscribed ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
              : "bg-rose-50 text-rose-800 border border-rose-100"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {isSubscribed && (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Perangkat terhubung & siap menerima notifikasi.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            isLoading={isTesting}
            className="text-xs py-1 px-2.5 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Uji Coba</span>
          </Button>
        </div>
      )}
    </div>
  );
}
