import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const stripeMock = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  paymentIntentRetrieve: vi.fn(),
  refundsCreate: vi.fn(),
  sessionsCreate: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: vi.fn(function StripeMock() {
    return {
      checkout: {
        sessions: {
          create: stripeMock.sessionsCreate,
        },
      },
      paymentIntents: {
        retrieve: stripeMock.paymentIntentRetrieve,
      },
      refunds: {
        create: stripeMock.refundsCreate,
      },
      webhooks: {
        constructEvent: stripeMock.constructEvent,
      },
    };
  }),
}));

const { createStripePaymentProvider } = await import(
  "@/modules/payments/infrastructure/providers/stripe.provider"
);

function createProvider() {
  return createStripePaymentProvider({
    environment: "sandbox",
    name: "stripe",
  });
}

function createWebhookEvent(type: string, object: Record<string, unknown>) {
  return {
    data: {
      object,
    },
    id: `evt_${type.replaceAll(".", "_")}`,
    livemode: false,
    type,
  };
}

describe("createStripePaymentProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_CANCEL_URL = "http://localhost:3000/checkout/cancel";
    process.env.STRIPE_SECRET_KEY = "sk_test_velto";
    process.env.STRIPE_SUCCESS_URL =
      "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_velto";
  });

  it("creates a Stripe Checkout Session", async () => {
    stripeMock.sessionsCreate.mockResolvedValue({
      id: "cs_test_123",
      payment_status: "unpaid",
      status: "open",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });

    const result = await createProvider().createCheckout({
      amountCents: 2790,
      currency: "BRL",
      customer: {
        email: "cliente@veltopay.com.br",
        name: "Cliente Velto",
      },
      description: "Compra de Produto Velto",
      idempotencyKey: "velto_ref_123",
      metadata: {
        checkout_id: "checkout_123",
        product_name: "Produto Velto",
      },
      method: "credit_card",
    });

    expect(result).toMatchObject({
      externalPaymentId: "velto_ref_123",
      providerCheckoutUrl: "https://checkout.stripe.com/c/pay/cs_test_123",
      providerReference: "cs_test_123",
      status: "processing",
    });
    expect(stripeMock.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: "velto_ref_123",
        mode: "payment",
        payment_method_types: ["card"],
      }),
      { idempotencyKey: "velto_ref_123" },
    );
  });

  it("maps checkout.session.completed as paid", async () => {
    stripeMock.constructEvent.mockReturnValue(
      createWebhookEvent("checkout.session.completed", {
        client_reference_id: "velto_ref_123",
        id: "cs_test_123",
        metadata: {
          velto_payment_reference: "velto_ref_123",
        },
        payment_intent: "pi_test_123",
        payment_status: "paid",
        status: "complete",
      }),
    );

    const event = await createProvider().webhook("{}", {
      "stripe-signature": "signed",
    });

    expect(event).toMatchObject({
      externalPaymentId: "velto_ref_123",
      status: "paid",
    });
  });

  it("maps payment_intent.payment_failed as failed", async () => {
    stripeMock.constructEvent.mockReturnValue(
      createWebhookEvent("payment_intent.payment_failed", {
        amount: 2790,
        amount_received: 0,
        currency: "brl",
        id: "pi_failed",
        metadata: {
          velto_payment_reference: "velto_ref_failed",
        },
        status: "requires_payment_method",
      }),
    );

    const event = await createProvider().webhook("{}", {
      "stripe-signature": "signed",
    });

    expect(event).toMatchObject({
      externalPaymentId: "velto_ref_failed",
      status: "failed",
    });
  });

  it("maps charge.refunded as refunded using PaymentIntent metadata", async () => {
    stripeMock.constructEvent.mockReturnValue(
      createWebhookEvent("charge.refunded", {
        id: "ch_refunded",
        metadata: {},
        payment_intent: "pi_refunded",
      }),
    );
    stripeMock.paymentIntentRetrieve.mockResolvedValue({
      metadata: {
        velto_payment_reference: "velto_ref_refunded",
      },
    });

    const event = await createProvider().webhook("{}", {
      "stripe-signature": "signed",
    });

    expect(event).toMatchObject({
      externalPaymentId: "velto_ref_refunded",
      status: "refunded",
    });
  });

  it("maps charge.dispute.created as chargeback", async () => {
    stripeMock.constructEvent.mockReturnValue(
      createWebhookEvent("charge.dispute.created", {
        charge: "ch_dispute",
        id: "dp_chargeback",
        payment_intent: "pi_chargeback",
      }),
    );
    stripeMock.paymentIntentRetrieve.mockResolvedValue({
      metadata: {
        velto_payment_reference: "velto_ref_chargeback",
      },
    });

    const event = await createProvider().webhook("{}", {
      "stripe-signature": "signed",
    });

    expect(event).toMatchObject({
      externalPaymentId: "velto_ref_chargeback",
      status: "chargeback",
    });
  });
});
