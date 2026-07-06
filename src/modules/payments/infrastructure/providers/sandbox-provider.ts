import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import {
  normalizeProviderStatus,
  type PaymentProvider,
  type RefundInput,
  type WebhookHeaders,
} from "@/modules/payments/domain/provider";
import type {
  CreateProviderCheckoutInput,
  PaymentProviderConfig,
  PaymentStatus,
  ProviderPayment,
  ProviderWebhookEvent,
} from "@/modules/payments/domain/types";

function createReference(...parts: string[]) {
  return parts
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .slice(0, 96);
}

function createCheckoutUrl(config: PaymentProviderConfig, reference: string) {
  return `https://sandbox.${config.name}.veltopay.local/checkout/${reference}`;
}

function verifySandboxSignature({
  rawBody,
  secret,
  signature,
}: {
  rawBody: string;
  secret?: string;
  signature: string | null;
}) {
  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  return (
    received.byteLength === expected.byteLength &&
    timingSafeEqual(received, expected)
  );
}

function parseWebhookPayload(rawBody: string): Record<string, unknown> {
  try {
    const payload = JSON.parse(rawBody) as unknown;

    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }
  } catch {
    // Invalid payloads are rejected by required fields below.
  }

  return {};
}

function getString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "string" ? value : "";
}

function toProviderPayment(
  externalPaymentId: string,
  status: PaymentStatus,
): ProviderPayment {
  return {
    amountCents: 0,
    currency: "BRL",
    externalPaymentId,
    rawStatus: status,
    status,
  };
}

export function createSandboxPaymentProvider(
  config: PaymentProviderConfig,
): PaymentProvider {
  return {
    async cancelPayment(externalPaymentId) {
      return toProviderPayment(externalPaymentId, "cancelled");
    },

    async capturePayment(externalPaymentId) {
      return toProviderPayment(externalPaymentId, "paid");
    },

    config,

    async createCheckout(input: CreateProviderCheckoutInput) {
      const providerReference = createReference(
        config.name,
        config.environment,
        input.idempotencyKey,
      );

      return {
        externalPaymentId: providerReference,
        providerCheckoutUrl: createCheckoutUrl(config, providerReference),
        providerReference,
        rawStatus: "processing",
        status: "processing",
      };
    },

    async getPayment(externalPaymentId) {
      return toProviderPayment(externalPaymentId, "processing");
    },

    async refund(input: RefundInput) {
      return toProviderPayment(input.externalPaymentId, "refunded");
    },

    async webhook(rawBody: string, headers: WebhookHeaders) {
      const signature =
        headers["x-velto-signature"] ??
        headers["stripe-signature"] ??
        headers["x-signature"] ??
        null;

      if (
        !verifySandboxSignature({
          rawBody,
          secret: config.webhookSecret,
          signature,
        })
      ) {
        throw new Error("Assinatura do webhook inválida.");
      }

      const payload = parseWebhookPayload(rawBody);
      const externalPaymentId =
        getString(payload, "externalPaymentId") ||
        getString(payload, "payment_id") ||
        getString(payload, "id");
      const eventType =
        getString(payload, "eventType") ||
        getString(payload, "type") ||
        "payment.updated";
      const externalEventId =
        getString(payload, "externalEventId") ||
        getString(payload, "event_id") ||
        createReference(
          config.name,
          eventType,
          externalPaymentId,
          Date.now().toString(),
        );
      const status = normalizeProviderStatus(
        getString(payload, "status") || "processing",
      );

      if (!externalPaymentId) {
        throw new Error("Webhook sem identificador do pagamento.");
      }

      return {
        eventType,
        externalEventId,
        externalPaymentId,
        payload,
        status,
      } satisfies ProviderWebhookEvent;
    },
  };
}
