import "server-only";

import { z } from "zod";

import type {
  PaymentEnvironment,
  PaymentProviderName,
} from "@/modules/payments/domain/types";

const paymentProviderSchema = z
  .enum(["stripe", "mercadopago", "asaas", "pagarme"])
  .default("stripe");

const paymentEnvironmentSchema = z
  .enum(["development", "sandbox", "production"])
  .default("sandbox");

const paymentEnvSchema = z.object({
  PAYMENT_PROVIDER: paymentProviderSchema,
  PAYMENT_ENVIRONMENT: paymentEnvironmentSchema,
  PAYMENT_WEBHOOK_SECRET: z.string().min(16).optional(),
});

export type PaymentEnv = {
  PAYMENT_ENVIRONMENT: PaymentEnvironment;
  PAYMENT_PROVIDER: PaymentProviderName;
  PAYMENT_WEBHOOK_SECRET?: string;
};

export const paymentEnv = paymentEnvSchema.parse({
  PAYMENT_ENVIRONMENT: process.env.PAYMENT_ENVIRONMENT,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || undefined,
}) satisfies PaymentEnv;
