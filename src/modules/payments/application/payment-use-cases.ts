import "server-only";

import { randomUUID } from "node:crypto";

import { findPublicCheckoutBySlug } from "@/modules/checkout/infrastructure/checkout.repository";
import type { WebhookHeaders } from "@/modules/payments/domain/provider";
import type {
  CreateCheckoutPaymentInput,
  PaymentAttempt,
  PaymentProviderName,
  PaymentWebhookResult,
} from "@/modules/payments/domain/types";
import { getPaymentProvider } from "@/modules/payments/infrastructure/provider-factory";
import {
  applyPaymentWebhookEvent,
  createCheckoutPaymentAttempt,
} from "@/modules/payments/infrastructure/payment.repository";
import { paymentEnv } from "@/shared/config/payment-env";
import { createSupabaseServerClient } from "@/shared/supabase";

export class PaymentUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentUseCaseError";
  }
}

function createPaymentDescription(productName: string) {
  return `Compra de ${productName} na Velto Pay`;
}

export async function createCheckoutPaymentUseCase(
  input: CreateCheckoutPaymentInput,
): Promise<PaymentAttempt> {
  const supabase = await createSupabaseServerClient();
  const checkout = await findPublicCheckoutBySlug(supabase, input.checkoutSlug);

  if (!checkout) {
    throw new PaymentUseCaseError("Checkout indisponível.");
  }

  const provider = getPaymentProvider();
  const method =
    input.method ?? (provider.config.name === "stripe" ? "credit_card" : "pix");
  const providerResult = await provider.createCheckout({
    amountCents: checkout.product.price_cents,
    currency: "BRL",
    customer: input.customer,
    description: createPaymentDescription(checkout.product.name),
    idempotencyKey: randomUUID(),
    metadata: {
      checkout_id: checkout.checkoutId,
      checkout_slug: checkout.checkoutSlug,
      product_image_url: checkout.product.image_url ?? "",
      product_name: checkout.product.name,
      product_id: checkout.product.id,
      producer_id: checkout.product.producer_id,
    },
    method,
  });

  return createCheckoutPaymentAttempt(supabase, {
    checkoutSlug: checkout.checkoutSlug,
    customerEmail: input.customer.email,
    customerName: input.customer.name,
    environment: provider.config.environment,
    method,
    provider: provider.config.name,
    providerResult,
  });
}

export async function processPaymentWebhookUseCase({
  headers,
  providerName,
  rawBody,
}: {
  headers: WebhookHeaders;
  providerName: PaymentProviderName;
  rawBody: string;
}): Promise<PaymentWebhookResult> {
  const provider = getPaymentProvider(providerName);

  if (
    paymentEnv.PAYMENT_ENVIRONMENT === "production" &&
    paymentEnv.PAYMENT_PROVIDER !== providerName
  ) {
    throw new PaymentUseCaseError("Provider de webhook inválido.");
  }

  const event = await provider.webhook(rawBody, headers);
  const supabase = await createSupabaseServerClient();

  return applyPaymentWebhookEvent(supabase, {
    event,
    provider: provider.config.name,
  });
}
