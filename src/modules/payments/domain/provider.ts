import type {
  CreateProviderCheckoutInput,
  PaymentProviderConfig,
  PaymentStatus,
  ProviderCheckoutResult,
  ProviderPayment,
  ProviderWebhookEvent,
} from "@/modules/payments/domain/types";

export type WebhookHeaders = Record<string, string | null>;

export type RefundInput = {
  amountCents?: number;
  externalPaymentId: string;
  reason?: string;
};

export type PaymentProvider = {
  cancelPayment(externalPaymentId: string): Promise<ProviderPayment>;
  capturePayment(externalPaymentId: string): Promise<ProviderPayment>;
  config: PaymentProviderConfig;
  createCheckout(
    input: CreateProviderCheckoutInput,
  ): Promise<ProviderCheckoutResult>;
  getPayment(externalPaymentId: string): Promise<ProviderPayment>;
  refund(input: RefundInput): Promise<ProviderPayment>;
  webhook(rawBody: string, headers: WebhookHeaders): Promise<ProviderWebhookEvent>;
};

export function normalizeProviderStatus(status: string): PaymentStatus {
  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "succeeded"
  ) {
    return "paid";
  }

  if (
    normalizedStatus === "authorized" ||
    normalizedStatus === "requires_capture"
  ) {
    return "authorized";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    normalizedStatus === "voided"
  ) {
    return "cancelled";
  }

  if (
    normalizedStatus === "refunded" ||
    normalizedStatus === "partially_refunded"
  ) {
    return "refunded";
  }

  if (normalizedStatus === "chargeback" || normalizedStatus === "disputed") {
    return "chargeback";
  }

  if (
    normalizedStatus === "failed" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "declined"
  ) {
    return "failed";
  }

  if (normalizedStatus === "processing" || normalizedStatus === "in_process") {
    return "processing";
  }

  return "pending";
}
