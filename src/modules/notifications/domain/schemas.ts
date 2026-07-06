import { z } from "zod";

export const pushSubscriptionSchema = z.object({
  auth: z.string().min(8).max(512),
  endpoint: z.string().url().max(2048),
  p256dh: z.string().min(8).max(512),
  platform: z.string().max(80).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
});

export const notificationPreferenceSchema = z.object({
  chargebacks_enabled: z.boolean(),
  failed_payments_enabled: z.boolean(),
  financial_enabled: z.boolean(),
  pix_enabled: z.boolean(),
  refunds_enabled: z.boolean(),
  sales_enabled: z.boolean(),
});

export type PushSubscriptionSchemaInput = z.infer<
  typeof pushSubscriptionSchema
>;
export type NotificationPreferenceSchemaInput = z.infer<
  typeof notificationPreferenceSchema
>;
