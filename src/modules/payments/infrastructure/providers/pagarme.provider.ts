import "server-only";

import type { PaymentProviderConfig } from "@/modules/payments/domain/types";
import { createSandboxPaymentProvider } from "@/modules/payments/infrastructure/providers/sandbox-provider";

export function createPagarmePaymentProvider(config: PaymentProviderConfig) {
  return createSandboxPaymentProvider({
    ...config,
    name: "pagarme",
  });
}
