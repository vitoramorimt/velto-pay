export type PaymentEnvironment = "development" | "sandbox" | "production";

export type PaymentProviderName = "stripe" | "mercadopago" | "asaas" | "pagarme";

export type PaymentMethod = "pix" | "credit_card" | "boleto";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "authorized"
  | "failed"
  | "refunded"
  | "cancelled"
  | "chargeback";

export type PaymentCurrency = "BRL";

export type PaymentCustomer = {
  email: string;
  name: string;
};

export type CreateCheckoutPaymentInput = {
  checkoutSlug: string;
  customer: PaymentCustomer;
  method?: PaymentMethod;
};

export type CreateProviderCheckoutInput = {
  amountCents: number;
  currency: PaymentCurrency;
  customer: PaymentCustomer;
  description: string;
  idempotencyKey: string;
  metadata: Record<string, string>;
  method: PaymentMethod;
};

export type ProviderCheckoutResult = {
  externalPaymentId: string;
  providerCheckoutUrl: string | null;
  providerReference: string;
  rawStatus: string;
  status: PaymentStatus;
};

export type PaymentAttempt = {
  checkoutUrl: string | null;
  orderId: string;
  paymentId: string;
  provider: PaymentProviderName;
  providerReference: string;
  status: PaymentStatus;
  transactionId: string;
};

export type ProviderPayment = {
  amountCents: number;
  currency: PaymentCurrency;
  externalPaymentId: string;
  rawStatus: string;
  status: PaymentStatus;
};

export type ProviderWebhookEvent = {
  externalEventId: string;
  externalPaymentId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: PaymentStatus;
};

export type PaymentWebhookResult = {
  eventId: string;
  paymentId: string | null;
  status: PaymentStatus;
};

export type PaymentProviderConfig = {
  environment: PaymentEnvironment;
  name: PaymentProviderName;
  webhookSecret?: string;
};
