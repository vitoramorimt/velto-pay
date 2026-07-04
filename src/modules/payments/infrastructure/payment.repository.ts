import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  paymentAttemptSchema,
  paymentWebhookResultSchema,
} from "@/modules/payments/domain/schemas";
import type {
  PaymentAttempt,
  PaymentEnvironment,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
  PaymentWebhookResult,
  ProviderCheckoutResult,
  ProviderWebhookEvent,
} from "@/modules/payments/domain/types";
import type { Database, Json } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;

function repositoryError(message: string): Error {
  return new Error(message);
}

function toAttempt(data: unknown): PaymentAttempt {
  const parsedData = paymentAttemptSchema.safeParse(data);

  if (!parsedData.success) {
    throw repositoryError("Resposta de pagamento inválida.");
  }

  return {
    checkoutUrl: parsedData.data.checkout_url,
    orderId: parsedData.data.order_id,
    paymentId: parsedData.data.payment_id,
    provider: parsedData.data.provider,
    providerReference: parsedData.data.provider_reference,
    status: parsedData.data.status,
    transactionId: parsedData.data.transaction_id,
  };
}

function toWebhookResult(data: unknown): PaymentWebhookResult {
  const parsedData = paymentWebhookResultSchema.safeParse(data);

  if (!parsedData.success) {
    throw repositoryError("Resposta de webhook inválida.");
  }

  return {
    eventId: parsedData.data.event_id,
    paymentId: parsedData.data.payment_id,
    status: parsedData.data.status,
  };
}

export async function createCheckoutPaymentAttempt(
  supabase: DatabaseClient,
  input: {
    checkoutSlug: string;
    customerEmail: string;
    customerName: string;
    environment: PaymentEnvironment;
    method: PaymentMethod;
    provider: PaymentProviderName;
    providerResult: ProviderCheckoutResult;
  },
): Promise<PaymentAttempt> {
  const { data, error } = await supabase.rpc("create_checkout_payment_attempt", {
    p_checkout_slug: input.checkoutSlug,
    p_customer_email: input.customerEmail,
    p_customer_name: input.customerName,
    p_environment: input.environment,
    p_external_payment_id: input.providerResult.externalPaymentId,
    p_method: input.method,
    p_provider: input.provider,
    p_provider_checkout_url: input.providerResult.providerCheckoutUrl,
    p_provider_payload: {
      raw_status: input.providerResult.rawStatus,
      reference: input.providerResult.providerReference,
    } satisfies Json,
    p_provider_reference: input.providerResult.providerReference,
    p_raw_provider_status: input.providerResult.rawStatus,
    p_status: input.providerResult.status,
  });

  if (error) {
    console.error("[payments] createCheckoutPaymentAttempt failed", error);
    throw repositoryError("Não foi possível iniciar o pagamento.");
  }

  return toAttempt(data);
}

export async function applyPaymentWebhookEvent(
  supabase: DatabaseClient,
  input: {
    event: ProviderWebhookEvent;
    provider: PaymentProviderName;
  },
): Promise<PaymentWebhookResult> {
  const { data, error } = await supabase.rpc("apply_payment_webhook_event", {
    p_event_type: input.event.eventType,
    p_external_event_id: input.event.externalEventId,
    p_external_payment_id: input.event.externalPaymentId,
    p_payload: input.event.payload as Json,
    p_provider: input.provider,
    p_status: input.event.status as PaymentStatus,
  });

  if (error) {
    console.error("[payments] applyPaymentWebhookEvent failed", error);
    throw repositoryError("Não foi possível processar o webhook de pagamento.");
  }

  return toWebhookResult(data);
}
