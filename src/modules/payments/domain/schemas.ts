import { z } from "zod";

export const paymentAttemptSchema = z.object({
  checkout_url: z.string().url().nullable(),
  order_id: z.string().uuid(),
  payment_id: z.string().uuid(),
  provider: z.enum(["stripe", "mercadopago", "asaas", "pagarme"]),
  provider_reference: z.string().min(1),
  status: z.enum([
    "pending",
    "processing",
    "paid",
    "authorized",
    "failed",
    "refunded",
    "cancelled",
    "chargeback",
  ]),
  transaction_id: z.string().uuid(),
});

export const paymentWebhookResultSchema = z.object({
  event_id: z.string().uuid(),
  payment_id: z.string().uuid().nullable(),
  status: z.enum([
    "pending",
    "processing",
    "paid",
    "authorized",
    "failed",
    "refunded",
    "cancelled",
    "chargeback",
  ]),
});
