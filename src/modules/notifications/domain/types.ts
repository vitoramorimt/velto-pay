import type { Enums, Json, Tables } from "@/shared/database.types";

export type NotificationEventType = Enums<"notification_event_type">;
export type Notification = Tables<"notifications">;
export type NotificationPreference = Tables<"notification_preferences">;
export type NotificationSubscription = Tables<"notification_subscriptions">;

export type NotificationRoute =
  | "/dashboard"
  | "/dashboard/checkout"
  | "/dashboard/financeiro"
  | "/dashboard/notificacoes";

export type NotificationMessage = {
  body: string;
  data: {
    route: NotificationRoute;
    [key: string]: Json | undefined;
  };
  title: string;
};

export type PushSubscriptionInput = {
  auth: string;
  endpoint: string;
  p256dh: string;
  platform?: string | null;
  userAgent?: string | null;
};

export type NotificationPreferenceInput = Pick<
  NotificationPreference,
  | "chargebacks_enabled"
  | "failed_payments_enabled"
  | "financial_enabled"
  | "pix_enabled"
  | "refunds_enabled"
  | "sales_enabled"
>;

export type NotificationListItem = {
  body: string;
  createdAt: string;
  eventType: NotificationEventType;
  id: string;
  readAt: string | null;
  route: NotificationRoute;
  title: string;
};

export type NotificationHeaderData = {
  isPushAvailable: boolean;
  latest: NotificationListItem[];
  publicKey: string | null;
  unreadCount: number;
};

export type NotificationCenterData = {
  filter: NotificationEventType | "all";
  isPushAvailable: boolean;
  notifications: NotificationListItem[];
  preferences: NotificationPreference;
  publicKey: string | null;
  unreadCount: number;
};

export type NotificationDelivery = {
  body: string;
  eventType: NotificationEventType;
  notificationId: string;
  producerId: string;
  targetUrl: NotificationRoute;
  title: string;
  userId: string;
};
