import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import {
  createNotificationMessage,
  getNotificationRoute,
} from "@/modules/notifications/domain/messages";
import {
  notificationPreferenceSchema,
  pushSubscriptionSchema,
} from "@/modules/notifications/domain/schemas";
import type {
  NotificationCenterData,
  NotificationEventType,
  NotificationHeaderData,
  NotificationPreferenceInput,
  PushSubscriptionInput,
} from "@/modules/notifications/domain/types";
import {
  countUnreadNotificationsByUser,
  createNotification,
  createPaymentNotificationDelivery,
  disableNotificationSubscription,
  ensureNotificationPreferences,
  listEnabledNotificationSubscriptions,
  listNotificationsByUser,
  markAllNotificationsRead,
  markNotificationReadById,
  updateNotificationPreferences,
  upsertNotificationSubscription,
} from "@/modules/notifications/infrastructure/notifications.repository";
import { sendPushNotificationToSubscriptions } from "@/modules/notifications/infrastructure/web-push.service";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import { notificationEnv, isPushConfigured } from "@/shared/config/notification-env";
import type { Enums, Json } from "@/shared/database.types";
import { createSupabaseAdminClient } from "@/shared/supabase/admin";
import { createSupabaseServerClient } from "@/shared/supabase";

export class NotificationUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationUseCaseError";
  }
}

async function getNotificationContext(redirectPath = "/dashboard") {
  const user = await requireAuthenticatedUser(redirectPath);
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new NotificationUseCaseError("Produtor não encontrado.");
  }

  return {
    producer,
    supabase,
    user,
  };
}

function getPublicKey(): string | null {
  return notificationEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export async function getNotificationHeaderData(): Promise<NotificationHeaderData> {
  const { producer, supabase, user } = await getNotificationContext();
  const [latest, unreadCount] = await Promise.all([
    listNotificationsByUser(supabase, {
      limit: 5,
      producerId: producer.id,
      userId: user.id,
    }),
    countUnreadNotificationsByUser(supabase, {
      producerId: producer.id,
      userId: user.id,
    }),
  ]);

  return {
    isPushAvailable: isPushConfigured(),
    latest,
    publicKey: getPublicKey(),
    unreadCount,
  };
}

export async function getNotificationCenterData({
  filter = "all",
}: {
  filter?: NotificationEventType | "all";
} = {}): Promise<NotificationCenterData> {
  const { producer, supabase, user } = await getNotificationContext(
    "/dashboard/notificacoes",
  );
  const [preferences, notifications, unreadCount] = await Promise.all([
    ensureNotificationPreferences(supabase, {
      producerId: producer.id,
      userId: user.id,
    }),
    listNotificationsByUser(supabase, {
      eventType: filter,
      limit: 80,
      producerId: producer.id,
      userId: user.id,
    }),
    countUnreadNotificationsByUser(supabase, {
      producerId: producer.id,
      userId: user.id,
    }),
  ]);

  return {
    filter,
    isPushAvailable: isPushConfigured(),
    notifications,
    preferences,
    publicKey: getPublicKey(),
    unreadCount,
  };
}

export async function subscribeToPushNotifications(
  input: PushSubscriptionInput,
): Promise<{ ok: true }> {
  const parsedInput = pushSubscriptionSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new NotificationUseCaseError(
      "Não foi possível validar este dispositivo.",
    );
  }

  if (!getPublicKey()) {
    throw new NotificationUseCaseError(
      "As notificações ainda não estão disponíveis nesta versão.",
    );
  }

  const { producer, supabase, user } = await getNotificationContext();

  await upsertNotificationSubscription(supabase, {
    producerId: producer.id,
    subscription: parsedInput.data,
    userId: user.id,
  });

  await ensureNotificationPreferences(supabase, {
    producerId: producer.id,
    userId: user.id,
  });

  return { ok: true };
}

export async function unsubscribeFromPushNotifications(
  endpoint: string,
): Promise<{ ok: true }> {
  const { supabase, user } = await getNotificationContext();

  await disableNotificationSubscription(supabase, {
    endpoint,
    userId: user.id,
  });

  return { ok: true };
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<{ ok: true }> {
  const { producer, supabase, user } = await getNotificationContext(
    "/dashboard/notificacoes",
  );

  await markNotificationReadById(supabase, {
    notificationId,
    producerId: producer.id,
    userId: user.id,
  });

  return { ok: true };
}

export async function markAllNotificationsAsRead(): Promise<{ ok: true }> {
  const { producer, supabase, user } = await getNotificationContext(
    "/dashboard/notificacoes",
  );

  await markAllNotificationsRead(supabase, {
    producerId: producer.id,
    userId: user.id,
  });

  return { ok: true };
}

export async function updateUserNotificationPreferences(
  input: NotificationPreferenceInput,
): Promise<{ ok: true }> {
  const parsedInput = notificationPreferenceSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new NotificationUseCaseError(
      "Não foi possível salvar as preferências.",
    );
  }

  const { producer, supabase, user } = await getNotificationContext(
    "/dashboard/notificacoes",
  );

  await updateNotificationPreferences(supabase, {
    preferences: parsedInput.data,
    producerId: producer.id,
    userId: user.id,
  });

  return { ok: true };
}

export async function sendNotificationForEvent(input: {
  data?: Record<string, Json | undefined>;
  eventType: NotificationEventType;
  producerId: string;
  userId: string;
}): Promise<void> {
  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    console.warn("[notifications] service role is not configured");
    return;
  }

  const message = createNotificationMessage(input.eventType, {
    ...input.data,
    target_url: getNotificationRoute(input.eventType),
  } as Record<string, string | null | undefined>);
  const notification = await createNotification(adminSupabase, {
    body: message.body,
    data: message.data,
    event_type: input.eventType,
    producer_id: input.producerId,
    title: message.title,
    user_id: input.userId,
  });
  const subscriptions = await listEnabledNotificationSubscriptions(
    adminSupabase,
    input.producerId,
  );

  await sendPushNotificationToSubscriptions(adminSupabase, {
    delivery: {
      body: notification.body,
      eventType: notification.eventType,
      notificationId: notification.id,
      producerId: input.producerId,
      targetUrl: notification.route,
      title: notification.title,
      userId: input.userId,
    },
    subscriptions,
  });
}

export async function sendNotificationForPaymentEvent(input: {
  paymentId: string;
  providerEventType?: string | null;
  status: Enums<"payment_status">;
}): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const delivery = await createPaymentNotificationDelivery(supabase, input);

    if (!delivery) {
      return;
    }

    const adminSupabase = createSupabaseAdminClient();

    if (!adminSupabase) {
      console.warn("[notifications] service role is not configured");
      return;
    }

    const subscriptions = await listEnabledNotificationSubscriptions(
      adminSupabase,
      delivery.producerId,
    );

    await sendPushNotificationToSubscriptions(adminSupabase, {
      delivery,
      subscriptions,
    });
  } catch (error) {
    console.error("[notifications] payment notification failed", error);
  }
}
