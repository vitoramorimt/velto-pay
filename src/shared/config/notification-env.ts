import "server-only";

import { z } from "zod";

const notificationEnvSchema = z.object({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_SUBJECT: z.string().min(1).default("mailto:suporte@veltopay.com.br"),
});

export type NotificationEnv = z.infer<typeof notificationEnvSchema>;

export const notificationEnv: NotificationEnv = notificationEnvSchema.parse({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY:
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || undefined,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || undefined,
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || undefined,
});

export function isPushConfigured(): boolean {
  return Boolean(
    notificationEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      notificationEnv.VAPID_PRIVATE_KEY &&
      notificationEnv.VAPID_SUBJECT,
  );
}
