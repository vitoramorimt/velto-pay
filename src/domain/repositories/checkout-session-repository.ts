import type { CheckoutSession } from "../entities/checkout-session";

export interface CreateCheckoutSessionData {
  merchantId: string;
  items: CheckoutSession["items"];
  allowedPaymentMethods: CheckoutSession["allowedPaymentMethods"];
  customer?: CheckoutSession["customer"];
  expiresInMinutes?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionRepository {
  findById(id: string): Promise<CheckoutSession | null>;
  create(data: CreateCheckoutSessionData): Promise<CheckoutSession>;
  updateStatus(
    id: string,
    status: CheckoutSession["status"],
  ): Promise<CheckoutSession>;
}
