import { createHmac } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createSandboxPaymentProvider } = await import(
  "@/modules/payments/infrastructure/providers/sandbox-provider"
);

const webhookSecret = "sandbox-webhook-secret";

function createProvider() {
  return createSandboxPaymentProvider({
    environment: "sandbox",
    name: "stripe",
    webhookSecret,
  });
}

function signWebhook(rawBody: string) {
  return createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
}

describe("createSandboxPaymentProvider", () => {
  it("creates a sandbox checkout payment", async () => {
    const provider = createProvider();
    const result = await provider.createCheckout({
      amountCents: 2790,
      currency: "BRL",
      customer: {
        email: "cliente@veltopay.com.br",
        name: "Cliente Velto",
      },
      description: "Compra de Produto Velto",
      idempotencyKey: "payment-approved",
      metadata: {
        checkout_id: "checkout_123",
      },
      method: "pix",
    });

    expect(result.status).toBe("processing");
    expect(result.providerCheckoutUrl).toContain(
      "https://sandbox.stripe.veltopay.local/checkout/",
    );
  });

  it("captures an approved payment", async () => {
    const provider = createProvider();
    const payment = await provider.capturePayment("pay_approved");

    expect(payment.status).toBe("paid");
  });

  it("refunds a payment", async () => {
    const provider = createProvider();
    const payment = await provider.refund({
      amountCents: 2790,
      externalPaymentId: "pay_refund",
      reason: "requested_by_customer",
    });

    expect(payment.status).toBe("refunded");
  });

  it("rejects a webhook with an invalid signature", async () => {
    const provider = createProvider();
    const rawBody = JSON.stringify({
      externalPaymentId: "pay_invalid",
      status: "approved",
    });

    await expect(
      provider.webhook(rawBody, {
        "x-velto-signature": "invalid",
      }),
    ).rejects.toThrow("Assinatura do webhook inválida.");
  });

  it("normalizes declined webhook events", async () => {
    const provider = createProvider();
    const rawBody = JSON.stringify({
      eventType: "payment.rejected",
      externalEventId: "evt_declined",
      externalPaymentId: "pay_declined",
      status: "rejected",
    });
    const event = await provider.webhook(rawBody, {
      "x-velto-signature": signWebhook(rawBody),
    });

    expect(event.status).toBe("failed");
    expect(event.externalPaymentId).toBe("pay_declined");
  });

  it("normalizes chargeback webhook events", async () => {
    const provider = createProvider();
    const rawBody = JSON.stringify({
      eventType: "payment.disputed",
      externalEventId: "evt_chargeback",
      externalPaymentId: "pay_chargeback",
      status: "disputed",
    });
    const event = await provider.webhook(rawBody, {
      "x-velto-signature": signWebhook(rawBody),
    });

    expect(event.status).toBe("chargeback");
  });
});
