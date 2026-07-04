import { NextResponse } from "next/server";

import { processPaymentWebhookUseCase } from "@/modules/payments/application/payment-use-cases";
import type { WebhookHeaders } from "@/modules/payments/domain/provider";
import type { PaymentProviderName } from "@/modules/payments/domain/types";

export const runtime = "nodejs";

const supportedProviders = new Set<PaymentProviderName>([
  "asaas",
  "mercadopago",
  "pagarme",
  "stripe",
]);

type PaymentWebhookRouteProps = {
  params: Promise<{
    provider: string;
  }>;
};

function toWebhookHeaders(headers: Headers): WebhookHeaders {
  return {
    "stripe-signature": headers.get("stripe-signature"),
    "x-signature": headers.get("x-signature"),
    "x-velto-signature": headers.get("x-velto-signature"),
  };
}

export async function POST(
  request: Request,
  { params }: PaymentWebhookRouteProps,
) {
  const { provider } = await params;

  if (!supportedProviders.has(provider as PaymentProviderName)) {
    return NextResponse.json(
      { error: "Provider de pagamento inválido." },
      { status: 404 },
    );
  }

  const rawBody = await request.text();

  try {
    const result = await processPaymentWebhookUseCase({
      headers: toWebhookHeaders(request.headers),
      providerName: provider as PaymentProviderName,
      rawBody,
    });

    return NextResponse.json({
      eventId: result.eventId,
      ok: true,
      paymentId: result.paymentId,
      status: result.status,
    });
  } catch (error) {
    console.error("[payments] webhook processing failed", error);

    return NextResponse.json(
      { error: "Webhook de pagamento inválido." },
      { status: 400 },
    );
  }
}
