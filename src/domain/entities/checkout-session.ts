import { Money } from "./money";
import type { PaymentMethod } from "./payment";

export type CheckoutSessionStatus =
  | "open"
  | "processing"
  | "paid"
  | "expired"
  | "canceled";

export interface CheckoutSessionItem {
  name: string;
  description?: string;
  quantity: number;
  unitAmount: Money;
}

export interface CheckoutSessionCustomer {
  name?: string;
  email?: string;
  document?: string;
}

export interface CheckoutSession {
  id: string;
  merchantId: string;
  merchantName: string;
  status: CheckoutSessionStatus;
  items: CheckoutSessionItem[];
  totalAmount: Money;
  allowedPaymentMethods: PaymentMethod[];
  customer: CheckoutSessionCustomer;
  expiresAt: string;
  createdAt: string;
  successUrl: string | null;
  cancelUrl: string | null;
}

export function isCheckoutSessionExpired(session: CheckoutSession): boolean {
  return new Date(session.expiresAt).getTime() < Date.now();
}

export function isCheckoutSessionPayable(session: CheckoutSession): boolean {
  return session.status === "open" && !isCheckoutSessionExpired(session);
}
