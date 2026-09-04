import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function configureWebPush() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:leonardudoh5@gmail.com";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendPushNotification(userId: string, title: string, body: string, url = "/notifications") {
  if (!configureWebPush()) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsEnabled: true },
  });
  if (!user?.notificationsEnabled) return;

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({ title, body, url })
        );
      } catch (error: any) {
        // Browsers return 404/410 when a subscription is expired or revoked.
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => undefined);
        }
      }
    })
  );
}
