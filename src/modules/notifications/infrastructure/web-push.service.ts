import "server-only";

import webPush from "web-push";

import type {
  NotificationDelivery,
  NotificationSubscription,
} from "@/modules/notifications/domain/types";
import {
  disableNotificationSubscriptionByEndpoint,
  markNotificationSent,
  touchNotificationSubscription,
} from "@/modules/notifications/infrastructure/notifications.repository";
import { notificationEnv } from "@/shared/config/notification-env";
import type { Database } from "@/shared/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type DatabaseClient = SupabaseClient<Database>;

export type PushDeliveryResult = {
  delivered: number;
  disabled: number;
  skipped: boolean;
};

function isPushConfigured(): boolean {
  return Boolean(
    notificationEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      notificationEnv.VAPID_PRIVATE_KEY &&
      notificationEnv.VAPID_SUBJECT,
  );
}

export function isInvalidSubscriptionError(error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode === 404 || error.statusCode === 410;
  }

  return false;
}

function configureVapid() {
  if (!isPushConfigured()) {
    return false;
  }

  webPush.setVapidDetails(
    notificationEnv.VAPID_SUBJECT,
    notificationEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    notificationEnv.VAPID_PRIVATE_KEY!,
  );

  return true;
}

function createPayload(delivery: NotificationDelivery): string {
  return JSON.stringify({
    badge: "/icons/icon-192.png",
    body: delivery.body,
    data: {
      notificationId: delivery.notificationId,
      route: delivery.targetUrl,
    },
    icon: "/icons/icon-192.png",
    tag: `velto-${delivery.notificationId}`,
    title: delivery.title,
  });
}

export async function sendPushNotificationToSubscriptions(
  supabase: DatabaseClient,
  input: {
    delivery: NotificationDelivery;
    subscriptions: NotificationSubscription[];
  },
): Promise<PushDeliveryResult> {
  if (!configureVapid()) {
    return {
      delivered: 0,
      disabled: 0,
      skipped: true,
    };
  }

  const payload = createPayload(input.delivery);
  let delivered = 0;
  let disabled = 0;

  await Promise.all(
    input.subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          payload,
        );
        delivered += 1;
        await touchNotificationSubscription(supabase, subscription.endpoint);
      } catch (error) {
        if (isInvalidSubscriptionError(error)) {
          disabled += 1;
          await disableNotificationSubscriptionByEndpoint(
            supabase,
            subscription.endpoint,
          );
          return;
        }

        console.error("[notifications] push delivery failed", error);
      }
    }),
  );

  if (delivered > 0) {
    await markNotificationSent(supabase, input.delivery.notificationId);
  }

  return {
    delivered,
    disabled,
    skipped: false,
  };
}
