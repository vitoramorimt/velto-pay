import "server-only";

import type { PaymentProvider } from "@/modules/payments/domain/provider";
import type {
  PaymentProviderConfig,
  PaymentProviderName,
} from "@/modules/payments/domain/types";
import { createAsaasPaymentProvider } from "@/modules/payments/infrastructure/providers/asaas.provider";
import { createMercadoPagoPaymentProvider } from "@/modules/payments/infrastructure/providers/mercado-pago.provider";
import { createPagarmePaymentProvider } from "@/modules/payments/infrastructure/providers/pagarme.provider";
import { createStripePaymentProvider } from "@/modules/payments/infrastructure/providers/stripe.provider";
import { paymentEnv } from "@/shared/config/payment-env";

const providerFactories: Record<
  PaymentProviderName,
  (config: PaymentProviderConfig) => PaymentProvider
> = {
  asaas: createAsaasPaymentProvider,
  mercadopago: createMercadoPagoPaymentProvider,
  pagarme: createPagarmePaymentProvider,
  stripe: createStripePaymentProvider,
};

export function getPaymentProvider(
  providerName: PaymentProviderName = paymentEnv.PAYMENT_PROVIDER,
): PaymentProvider {
  const config: PaymentProviderConfig = {
    environment: paymentEnv.PAYMENT_ENVIRONMENT,
    name: providerName,
    webhookSecret: paymentEnv.PAYMENT_WEBHOOK_SECRET,
  };

  return providerFactories[providerName](config);
}
