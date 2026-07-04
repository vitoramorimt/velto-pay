import "server-only";

import { z } from "zod";

const stripeEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  STRIPE_CANCEL_URL: z.string().url().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY é obrigatória."),
  STRIPE_SUCCESS_URL: z.string().url().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  VERCEL_URL: z.string().optional(),
});

export type StripeEnv = {
  cancelUrl: string;
  publishableKey?: string;
  secretKey: string;
  successUrl: string;
  webhookSecret?: string;
};

function resolveAppUrl(env: z.infer<typeof stripeEnvSchema>) {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getStripeEnv(): StripeEnv {
  const env = stripeEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
    STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || undefined,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || undefined,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || undefined,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || undefined,
    VERCEL_URL: process.env.VERCEL_URL || undefined,
  });
  const appUrl = resolveAppUrl(env);

  return {
    cancelUrl: env.STRIPE_CANCEL_URL ?? `${appUrl}/checkout/cancel`,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    successUrl:
      env.STRIPE_SUCCESS_URL ??
      `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  };
}
