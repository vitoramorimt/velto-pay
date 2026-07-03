import { randomUUID } from "crypto";

import type { CheckoutSession } from "@/domain/entities/checkout-session";
import { Money } from "@/domain/entities/money";
import type {
  CheckoutSessionRepository,
  CreateCheckoutSessionData,
} from "@/domain/repositories/checkout-session-repository";

export const MOCK_SESSION_ID = "mock-session-id";

// Next.js dev (Turbopack) compiles route handlers and pages into separate
// module graphs, so a plain module-level Map would not be shared between
// them. Stashing it on `globalThis` keeps a single store per server process,
// the same pattern commonly used for singleton clients (e.g. Prisma) in dev.
const globalForMockStore = globalThis as unknown as {
  __veltoMockCheckoutSessions?: Map<string, CheckoutSession>;
};

function getStore(): Map<string, CheckoutSession> {
  if (!globalForMockStore.__veltoMockCheckoutSessions) {
    const store = new Map<string, CheckoutSession>();
    store.set(MOCK_SESSION_ID, seedDefaultSession());
    globalForMockStore.__veltoMockCheckoutSessions = store;
  }
  return globalForMockStore.__veltoMockCheckoutSessions;
}

function seedDefaultSession(): CheckoutSession {
  return {
    id: MOCK_SESSION_ID,
    merchantId: "merchant-demo",
    merchantName: "Loja Demo VeltoPay",
    status: "open",
    items: [
      {
        name: "Curso completo de Marketing Digital",
        description: "Acesso vitalício + certificado",
        quantity: 1,
        unitAmount: Money.fromCents(19700),
      },
    ],
    totalAmount: Money.fromCents(19700),
    allowedPaymentMethods: ["credit_card", "debit_card", "pix", "boleto"],
    customer: {},
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    createdAt: new Date().toISOString(),
    successUrl: null,
    cancelUrl: null,
  };
}

export class MockCheckoutSessionRepository implements CheckoutSessionRepository {
  async findById(id: string): Promise<CheckoutSession | null> {
    return getStore().get(id) ?? null;
  }

  async create(data: CreateCheckoutSessionData): Promise<CheckoutSession> {
    const totalCents = data.items.reduce(
      (sum, item) => sum + item.unitAmount.cents * item.quantity,
      0,
    );
    const session: CheckoutSession = {
      id: randomUUID(),
      merchantId: data.merchantId,
      merchantName: "Loja Demo VeltoPay",
      status: "open",
      items: data.items,
      totalAmount: Money.fromCents(totalCents),
      allowedPaymentMethods: data.allowedPaymentMethods,
      customer: data.customer ?? {},
      expiresAt: new Date(
        Date.now() + (data.expiresInMinutes ?? 30) * 60_000,
      ).toISOString(),
      createdAt: new Date().toISOString(),
      successUrl: data.successUrl ?? null,
      cancelUrl: data.cancelUrl ?? null,
    };
    getStore().set(session.id, session);
    return session;
  }

  async updateStatus(
    id: string,
    status: CheckoutSession["status"],
  ): Promise<CheckoutSession> {
    const session = getStore().get(id);
    if (!session) {
      throw new Error("Checkout session not found");
    }
    const updated = { ...session, status };
    getStore().set(id, updated);
    return updated;
  }
}
