import type { CheckoutSession } from "@/domain/entities/checkout-session";

export interface CheckoutSessionItemView {
  name: string;
  description?: string;
  quantity: number;
  unitAmountCents: number;
}

export interface CheckoutSessionView {
  id: string;
  merchantName: string;
  items: CheckoutSessionItemView[];
  totalAmountCents: number;
  allowedPaymentMethods: CheckoutSession["allowedPaymentMethods"];
  successUrl: string | null;
}

export function toCheckoutSessionView(session: CheckoutSession): CheckoutSessionView {
  return {
    id: session.id,
    merchantName: session.merchantName,
    items: session.items.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitAmountCents: item.unitAmount.cents,
    })),
    totalAmountCents: session.totalAmount.cents,
    allowedPaymentMethods: session.allowedPaymentMethods,
    successUrl: session.successUrl,
  };
}
