import "server-only";

import type { PaymentProviderConfig } from "@/modules/payments/domain/types";
import { createSandboxPaymentProvider } from "@/modules/payments/infrastructure/providers/sandbox-provider";

export function createMercadoPagoPaymentProvider(config: PaymentProviderConfig) {
  return createSandboxPaymentProvider({
    ...config,
    name: "mercadopago",
  });
}
