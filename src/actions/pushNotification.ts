"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushSubscriptions, users, attendance } from "@/lib/db/schema";
import { eq, and, isNull, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import webpush from "web-push";

// Default fallback VAPID keys if env is not configured yet

function configureWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_SUBJECT || "mailto:admin@maganghan.com";

  if (!publicKey || !privateKey) {
    console.warn("VAPID keys not configured. Push notifications disabled.");
    return false;
  }

  try {
    webpush.setVapidDetails(email, publicKey, privateKey);
    return true;
  } catch (err) {
    console.warn("WebPush VAPID setup warning:", err);
    return false;
  }
}

export async function getVapidPublicKeyAction(): Promise<string> {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

export async function subscribePushNotificationAction(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { error: "Payload langganan notifikasi tidak valid." };
  }

  try {
    // Check if endpoint already exists
    const existing = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pushSubscriptions)
        .set({
          userId: session.user.id,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        })
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Save push subscription error:", error);
    return { error: "Gagal menyimpan langganan notifikasi." };
  }
}

export async function sendTestPushNotificationAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!configureWebPush()) {
    return { error: "Kunci VAPID belum dikonfigurasi. Hubungi administrator." };
  }

  try {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, session.user.id));

    if (subs.length === 0) {
      return { error: "Belum ada langganan notifikasi terdaftar untuk perangkat ini." };
    }

    const payload = JSON.stringify({
      title: "🔔 Uji Coba Notifikasi Presensi",
      body: `Halo ${session.user.name || 'User'}, notifikasi pengingat presensi berfungsi dengan baik!`,
      url: "/intern/absen",
    });

    let sent = 0;
    let lastErrorDetail = "";

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sent++;
      } catch (err: unknown) {
        const errorObj = err as { statusCode?: number; message?: string; body?: string };
        console.error("Failed to send push notification:", sub.endpoint, errorObj);
        lastErrorDetail = errorObj.body || errorObj.message || String(err);

        const statusCode = errorObj.statusCode;
        // Clean up expired or invalid subscriptions (400, 401, 403, 404, 410)
        if (statusCode && [400, 401, 403, 404, 410].includes(statusCode)) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }

    if (sent === 0) {
      return {
        error: "Gagal mengirim notifikasi. Kunci berlangganan browser Anda belum diperbarui. Silakan klik 'Nonaktifkan' lalu klik 'Aktifkan' kembali notifikasi.",
      };
    }

    return { success: true, sentCount: sent };
  } catch (error) {
    console.error("Send test push error:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengirim notifikasi uji coba.";
    return { error: msg };
  }
}

export async function sendAttendanceReminderPushAction() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  if (!configureWebPush()) {
    return { error: "Kunci VAPID belum dikonfigurasi." };
  }

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // 1. Get active interns
    const activeInterns = await db
      .select({ id: users.id, nama: users.nama })
      .from(users)
      .where(and(eq(users.role, "intern"), eq(users.statusAktif, true)));

    if (activeInterns.length === 0) {
      return { success: true, sentCount: 0, message: "Tidak ada anak magang aktif." };
    }

    // 2. Get today's attendance records to find who hasn't checked in
    const todayAttendance = await db
      .select({ userId: attendance.userId })
      .from(attendance)
      .where(eq(attendance.tanggal, todayStr));

    const checkedInUserIds = new Set(todayAttendance.map((a) => a.userId));
    const targetInterns = activeInterns.filter((i) => !checkedInUserIds.has(i.id));

    if (targetInterns.length === 0) {
      return { success: true, sentCount: 0, message: "Semua anak magang sudah presensi hari ini!" };
    }

    const targetUserIds = targetInterns.map((i) => i.id);

    // 3. Fetch push subscriptions for target interns
    const subs = await db
      .select({
        id: pushSubscriptions.id,
        userId: pushSubscriptions.userId,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
        userName: users.nama,
      })
      .from(pushSubscriptions)
      .innerJoin(users, eq(pushSubscriptions.userId, users.id))
      .where(
        // Filter subscriptions of target users
        and(eq(users.statusAktif, true))
      );

    const targetSubs = subs.filter((s) => targetUserIds.includes(s.userId));

    if (targetSubs.length === 0) {
      return {
        success: true,
        sentCount: 0,
        unregisteredCount: targetInterns.length,
        message: `${targetInterns.length} anak magang belum presensi, namun belum mengaktifkan izin notifikasi di browser.`,
      };
    }

    let sent = 0;
    for (const sub of targetSubs) {
      const payload = JSON.stringify({
        title: "⏰ Pengingat Absensi Masuk",
        body: `Halo ${sub.userName}, Anda belum melakukan presensi hari ini. Silakan absen sekarang!`,
        url: "/intern/absen",
      });

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sent++;
      } catch (err: unknown) {
        console.error("Failed to send reminder push:", err);
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode && [400, 401, 403, 404, 410].includes(statusCode)) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }

    return {
      success: true,
      sentCount: sent,
      targetCount: targetInterns.length,
      message: `Notifikasi berhasil dikirim ke ${sent} perangkat anak magang yang belum presensi!`,
    };
  } catch (error) {
    console.error("Send attendance reminder error:", error);
    return { error: "Gagal mengirim notifikasi pengingat." };
  }
}
