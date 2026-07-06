import "server-only";

import Stripe from "stripe";

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
import { getStripeEnv } from "@/shared/config/stripe-env";

const stripeWebhookEvents = new Set<string>([
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
]);

function createStripeClient(secretKey: string) {
  return new Stripe(secretKey, {
    appInfo: {
      name: "Velto Pay",
      version: "0.1.0",
    },
  });
}

function toStripeMetadata(
  input: CreateProviderCheckoutInput,
  config: PaymentProviderConfig,
) {
  return Object.fromEntries(
    Object.entries({
      ...input.metadata,
      customer_email: input.customer.email,
      customer_name: input.customer.name,
      velto_environment: config.environment,
      velto_payment_method: input.method,
      velto_payment_reference: input.idempotencyKey,
    }).map(([key, value]) => [key, String(value).slice(0, 500)]),
  );
}

function toStripeImages(imageUrl: string | undefined): string[] | undefined {
  if (!imageUrl) {
    return undefined;
  }

  try {
    const url = new URL(imageUrl);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return [url.toString()];
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getStripeId(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") {
    return value;
  }

  return value?.id ?? null;
}

function getMetadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeStripePaymentIntentStatus(
  status: Stripe.PaymentIntent.Status,
): PaymentStatus {
  if (status === "succeeded") {
    return "paid";
  }

  if (status === "requires_capture") {
    return "authorized";
  }

  if (status === "processing" || status === "requires_action") {
    return "processing";
  }

  if (status === "canceled") {
    return "cancelled";
  }

  if (status === "requires_payment_method") {
    return "failed";
  }

  return normalizeProviderStatus(status);
}

function normalizeCheckoutSessionStatus(
  session: Stripe.Checkout.Session,
): PaymentStatus {
  if (session.payment_status === "paid") {
    return "paid";
  }

  if (session.status === "expired") {
    return "cancelled";
  }

  return "processing";
}

function toProviderPayment(
  paymentIntent: Stripe.PaymentIntent,
): ProviderPayment {
  return {
    amountCents: paymentIntent.amount_received || paymentIntent.amount,
    currency: "BRL",
    externalPaymentId: paymentIntent.id,
    rawStatus: paymentIntent.status,
    status: normalizeStripePaymentIntentStatus(paymentIntent.status),
  };
}

function toSerializablePayload(
  event: Stripe.Event,
  object: Stripe.Event.Data.Object,
  extra: Record<string, string | null>,
): Record<string, unknown> {
  return {
    ...extra,
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    stripe_livemode: event.livemode,
    stripe_object: JSON.parse(JSON.stringify(object)) as unknown,
  };
}

function getPaymentIntentEvent(
  event: Stripe.Event,
): ProviderWebhookEvent | null {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const reference =
    getMetadataValue(paymentIntent.metadata, "velto_payment_reference") ??
    paymentIntent.id;

  return {
    eventType: event.type,
    externalEventId: event.id,
    externalPaymentId: reference,
    payload: toSerializablePayload(event, paymentIntent, {
      stripe_payment_intent_id: paymentIntent.id,
      velto_payment_reference: reference,
    }),
    status:
      event.type === "payment_intent.payment_failed"
        ? "failed"
        : normalizeStripePaymentIntentStatus(paymentIntent.status),
  };
}

async function getPaymentIntentReference(
  stripe: Stripe,
  paymentIntentId: string | null,
) {
  if (!paymentIntentId) {
    return null;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return getMetadataValue(paymentIntent.metadata, "velto_payment_reference");
}

function getCheckoutSessionEvent(
  event: Stripe.Event,
): ProviderWebhookEvent | null {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntentId = getStripeId(session.payment_intent);
  const reference =
    getMetadataValue(session.metadata, "velto_payment_reference") ??
    session.client_reference_id ??
    session.id;

  return {
    eventType: event.type,
    externalEventId: event.id,
    externalPaymentId: reference,
    payload: toSerializablePayload(event, session, {
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      velto_payment_reference: reference,
    }),
    status: normalizeCheckoutSessionStatus(session),
  };
}

async function getRefundedChargeEvent(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<ProviderWebhookEvent | null> {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = getStripeId(charge.payment_intent);
  const reference =
    getMetadataValue(charge.metadata, "velto_payment_reference") ??
    (await getPaymentIntentReference(stripe, paymentIntentId)) ??
    paymentIntentId ??
    charge.id;

  return {
    eventType: event.type,
    externalEventId: event.id,
    externalPaymentId: reference,
    payload: toSerializablePayload(event, charge, {
      stripe_charge_id: charge.id,
      stripe_payment_intent_id: paymentIntentId,
      velto_payment_reference: reference,
    }),
    status: "refunded",
  };
}

async function getDisputeEvent(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<ProviderWebhookEvent | null> {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = getStripeId(dispute.charge);
  const paymentIntentId = getStripeId(dispute.payment_intent);
  const reference =
    (await getPaymentIntentReference(stripe, paymentIntentId)) ??
    paymentIntentId ??
    chargeId ??
    dispute.id;

  return {
    eventType: event.type,
    externalEventId: event.id,
    externalPaymentId: reference,
    payload: toSerializablePayload(event, dispute, {
      stripe_charge_id: chargeId,
      stripe_dispute_id: dispute.id,
      stripe_payment_intent_id: paymentIntentId,
      velto_payment_reference: reference,
    }),
    status: "chargeback",
  };
}

async function toWebhookEvent(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<ProviderWebhookEvent | null> {
  if (!stripeWebhookEvents.has(event.type)) {
    return null;
  }

  if (event.type === "checkout.session.completed") {
    return getCheckoutSessionEvent(event);
  }

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed"
  ) {
    return getPaymentIntentEvent(event);
  }

  if (event.type === "charge.refunded") {
    return getRefundedChargeEvent(stripe, event);
  }

  if (event.type === "charge.dispute.created") {
    return getDisputeEvent(stripe, event);
  }

  return null;
}

export function createStripePaymentProvider(
  config: PaymentProviderConfig,
): PaymentProvider {
  const stripeEnv = getStripeEnv();
  const stripe = createStripeClient(stripeEnv.secretKey);

  return {
    async cancelPayment(externalPaymentId) {
      const paymentIntent = await stripe.paymentIntents.cancel(
        externalPaymentId,
      );

      return toProviderPayment(paymentIntent);
    },

    async capturePayment(externalPaymentId) {
      const paymentIntent = await stripe.paymentIntents.capture(
        externalPaymentId,
      );

      return toProviderPayment(paymentIntent);
    },

    config,

    async createCheckout(input: CreateProviderCheckoutInput) {
      const metadata = toStripeMetadata(input, config);
      const productName = metadata.product_name ?? input.description;
      const imageUrl = metadata.product_image_url;
      const session = await stripe.checkout.sessions.create(
        {
          cancel_url: stripeEnv.cancelUrl,
          client_reference_id: input.idempotencyKey,
          customer_email: input.customer.email,
          line_items: [
            {
              price_data: {
                currency: input.currency.toLowerCase(),
                product_data: {
                  description: input.description,
                  images: toStripeImages(imageUrl),
                  metadata,
                  name: productName,
                },
                unit_amount: input.amountCents,
              },
              quantity: 1,
            },
          ],
          locale: "pt-BR",
          metadata,
          mode: "payment",
          payment_intent_data: {
            metadata,
          },
          payment_method_types: ["card"],
          success_url: stripeEnv.successUrl,
        },
        {
          idempotencyKey: input.idempotencyKey,
        },
      );

      return {
        externalPaymentId: input.idempotencyKey,
        providerCheckoutUrl: session.url,
        providerReference: session.id,
        rawStatus: session.status ?? "open",
        status: normalizeCheckoutSessionStatus(session),
      };
    },

    async getPayment(externalPaymentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        externalPaymentId,
      );

      return toProviderPayment(paymentIntent);
    },

    async refund(input: RefundInput) {
      const refund = await stripe.refunds.create({
        amount: input.amountCents,
        metadata: {
          reason: input.reason ?? "requested_by_customer",
        },
        payment_intent: input.externalPaymentId,
      });

      return {
        amountCents: refund.amount,
        currency: "BRL",
        externalPaymentId: input.externalPaymentId,
        rawStatus: refund.status ?? "processing",
        status: refund.status === "succeeded" ? "refunded" : "processing",
      };
    },

    async webhook(rawBody: string, headers: WebhookHeaders) {
      const signature = headers["stripe-signature"];

      if (!stripeEnv.webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET não configurado.");
      }

      if (!signature) {
        throw new Error("Assinatura Stripe ausente.");
      }

      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        stripeEnv.webhookSecret,
      );
      const webhookEvent = await toWebhookEvent(stripe, event);

      if (!webhookEvent) {
        throw new Error(`Evento Stripe não suportado: ${event.type}`);
      }

      return webhookEvent;
    },
  };
}
