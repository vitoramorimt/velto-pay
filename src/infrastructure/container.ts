import type { PaymentGateway } from "@/domain/gateways/payment-gateway";
import type { CheckoutSessionRepository } from "@/domain/repositories/checkout-session-repository";

import { MockPaymentGateway } from "./gateways/mock-payment-gateway";
import { MockCheckoutSessionRepository } from "./repositories/mock-checkout-session-repository";
import { SupabaseCheckoutSessionRepository } from "./repositories/supabase-checkout-session-repository";
import { createSupabaseServerClient } from "./supabase/server";

function isMockCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_CHECKOUT === "true";
}

export async function getCheckoutSessionRepository(): Promise<CheckoutSessionRepository> {
  if (isMockCheckoutEnabled()) {
    return new MockCheckoutSessionRepository();
  }
  const client = await createSupabaseServerClient();
  return new SupabaseCheckoutSessionRepository(client);
}

let mockGateway: PaymentGateway | null = null;

export function getPaymentGateway(): PaymentGateway {
  // Only a mock implementation exists so far; no real acquirer has been
  // selected yet. Swap this for a real PaymentGateway once one is chosen.
  mockGateway ??= new MockPaymentGateway();
  return mockGateway;
}
