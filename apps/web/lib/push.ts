import webpush from "web-push";
import { prisma } from "./db";

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL;
  if (!publicKey || !privateKey || !email) {
    console.warn("VAPID keys not configured — push notifications disabled");
    return;
  }
  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  vapidConfigured = true;
}

interface PushPayload {
  title: string;
  body: string;
  link?: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  ensureVapidConfigured();
  if (!vapidConfigured) return { sent: 0, failed: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (error: unknown) {
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : null;

      if (statusCode === 410 || statusCode === 404) {
        // Subscription expired or no longer valid — remove it
        await prisma.pushSubscription.delete({
          where: { id: sub.id },
        });
      }
      failed++;
    }
  }

  return { sent, failed };
}
