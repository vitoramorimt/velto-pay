import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  NotificationDelivery,
  NotificationEventType,
  NotificationListItem,
  NotificationPreference,
  NotificationPreferenceInput,
  NotificationRoute,
  NotificationSubscription,
  PushSubscriptionInput,
} from "@/modules/notifications/domain/types";
import type {
  Database,
  Tables,
  TablesInsert,
} from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;
type NotificationInsert = TablesInsert<"notifications">;
type SubscriptionInsert = TablesInsert<"notification_subscriptions">;
type PreferenceUpdate = Database["public"]["Tables"]["notification_preferences"]["Update"];
type NotificationRow = Tables<"notifications">;

function repositoryError(message: string): Error {
  return new Error(message);
}

function getNotificationRoute(row: NotificationRow): NotificationRoute {
  if (
    row.data &&
    typeof row.data === "object" &&
    !Array.isArray(row.data) &&
    "target_url" in row.data &&
    typeof row.data.target_url === "string"
  ) {
    return normalizeRoute(row.data.target_url);
  }

  if (
    row.data &&
    typeof row.data === "object" &&
    !Array.isArray(row.data) &&
    "route" in row.data &&
    typeof row.data.route === "string"
  ) {
    return normalizeRoute(row.data.route);
  }

  return "/dashboard/notificacoes";
}

function normalizeRoute(value: string): NotificationRoute {
  if (
    value === "/dashboard" ||
    value === "/dashboard/checkout" ||
    value === "/dashboard/financeiro" ||
    value === "/dashboard/notificacoes"
  ) {
    return value;
  }

  return "/dashboard/notificacoes";
}

function toListItem(row: NotificationRow): NotificationListItem {
  return {
    body: row.body,
    createdAt: row.created_at,
    eventType: row.event_type,
    id: row.id,
    readAt: row.read_at,
    route: getNotificationRoute(row),
    title: row.title,
  };
}

export async function ensureNotificationPreferences(
  supabase: DatabaseClient,
  input: {
    producerId: string;
    userId: string;
  },
): Promise<NotificationPreference> {
  const { data, error } = await supabase.rpc("ensure_notification_preferences", {
    p_producer_id: input.producerId,
    p_user_id: input.userId,
  });

  if (error) {
    throw repositoryError("Não foi possível carregar as preferências.");
  }

  return data;
}

export async function updateNotificationPreferences(
  supabase: DatabaseClient,
  input: {
    preferences: NotificationPreferenceInput;
    producerId: string;
    userId: string;
  },
): Promise<NotificationPreference> {
  await ensureNotificationPreferences(supabase, input);

  const payload: PreferenceUpdate = input.preferences;
  const { data, error } = await supabase
    .from("notification_preferences")
    .update(payload)
    .eq("user_id", input.userId)
    .eq("producer_id", input.producerId)
    .select("*")
    .single();

  if (error) {
    throw repositoryError("Não foi possível salvar as preferências.");
  }

  return data;
}

export async function upsertNotificationSubscription(
  supabase: DatabaseClient,
  input: {
    producerId: string;
    subscription: PushSubscriptionInput;
    userId: string;
  },
): Promise<NotificationSubscription> {
  const payload: SubscriptionInsert = {
    auth: input.subscription.auth,
    enabled: true,
    endpoint: input.subscription.endpoint,
    p256dh: input.subscription.p256dh,
    platform: input.subscription.platform ?? null,
    producer_id: input.producerId,
    user_agent: input.subscription.userAgent ?? null,
    user_id: input.userId,
  };

  const { data, error } = await supabase
    .from("notification_subscriptions")
    .upsert(payload, { onConflict: "endpoint" })
    .select("*")
    .single();

  if (error) {
    throw repositoryError("Não foi possível ativar as notificações.");
  }

  return data;
}

export async function disableNotificationSubscription(
  supabase: DatabaseClient,
  input: {
    endpoint: string;
    userId: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("notification_subscriptions")
    .update({ enabled: false })
    .eq("user_id", input.userId)
    .eq("endpoint", input.endpoint);

  if (error) {
    throw repositoryError("Não foi possível desativar as notificações.");
  }
}

export async function disableNotificationSubscriptionByEndpoint(
  supabase: DatabaseClient,
  endpoint: string,
): Promise<void> {
  const { error } = await supabase
    .from("notification_subscriptions")
    .update({ enabled: false })
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[notifications] disable subscription failed", error);
  }
}

export async function listEnabledNotificationSubscriptions(
  supabase: DatabaseClient,
  producerId: string,
): Promise<NotificationSubscription[]> {
  const { data, error } = await supabase
    .from("notification_subscriptions")
    .select("*")
    .eq("producer_id", producerId)
    .eq("enabled", true);

  if (error) {
    throw repositoryError("Não foi possível carregar os dispositivos.");
  }

  return data ?? [];
}

export async function touchNotificationSubscription(
  supabase: DatabaseClient,
  endpoint: string,
): Promise<void> {
  const { error } = await supabase
    .from("notification_subscriptions")
    .update({ last_used_at: new Date().toISOString() })
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[notifications] touch subscription failed", error);
  }
}

export async function listNotificationsByUser(
  supabase: DatabaseClient,
  input: {
    eventType?: NotificationEventType | "all";
    limit?: number;
    producerId: string;
    userId: string;
  },
): Promise<NotificationListItem[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", input.userId)
    .eq("producer_id", input.producerId)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 50);

  if (input.eventType && input.eventType !== "all") {
    query = query.eq("event_type", input.eventType);
  }

  const { data, error } = await query;

  if (error) {
    throw repositoryError("Não foi possível carregar as notificações.");
  }

  return (data ?? []).map(toListItem);
}

export async function countUnreadNotificationsByUser(
  supabase: DatabaseClient,
  input: {
    producerId: string;
    userId: string;
  },
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("producer_id", input.producerId)
    .is("read_at", null);

  if (error) {
    throw repositoryError("Não foi possível contar notificações.");
  }

  return count ?? 0;
}

export async function markNotificationReadById(
  supabase: DatabaseClient,
  input: {
    notificationId: string;
    producerId: string;
    userId: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", input.notificationId)
    .eq("user_id", input.userId)
    .eq("producer_id", input.producerId);

  if (error) {
    throw repositoryError("Não foi possível marcar a notificação como lida.");
  }
}

export async function markAllNotificationsRead(
  supabase: DatabaseClient,
  input: {
    producerId: string;
    userId: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", input.userId)
    .eq("producer_id", input.producerId)
    .is("read_at", null);

  if (error) {
    throw repositoryError("Não foi possível marcar notificações como lidas.");
  }
}

export async function createNotification(
  supabase: DatabaseClient,
  input: NotificationInsert,
): Promise<NotificationListItem> {
  const { data, error } = await supabase
    .from("notifications")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw repositoryError("Não foi possível criar a notificação.");
  }

  return toListItem(data);
}

export async function markNotificationSent(
  supabase: DatabaseClient,
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    console.error("[notifications] mark sent failed", error);
  }
}

export async function createPaymentNotificationDelivery(
  supabase: DatabaseClient,
  input: {
    paymentId: string;
    providerEventType?: string | null;
    status: Database["public"]["Enums"]["payment_status"];
  },
): Promise<NotificationDelivery | null> {
  const { data, error } = await supabase.rpc(
    "create_notification_for_payment_event",
    {
      p_payment_id: input.paymentId,
      p_provider_event_type: input.providerEventType ?? null,
      p_status: input.status,
    },
  );

  if (error) {
    throw repositoryError("Não foi possível registrar a notificação.");
  }

  const delivery = data?.[0];

  if (!delivery) {
    return null;
  }

  return {
    body: delivery.body,
    eventType: delivery.event_type,
    notificationId: delivery.notification_id,
    producerId: delivery.producer_id,
    targetUrl: normalizeRoute(delivery.target_url),
    title: delivery.title,
    userId: delivery.user_id,
  };
}
