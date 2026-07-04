import "server-only";

import { createSandboxPaymentProvider } from "@/modules/payments/infrastructure/providers/sandbox-provider";
import type { PaymentProviderConfig } from "@/modules/payments/domain/types";

export function createStripePaymentProvider(config: PaymentProviderConfig) {
  return createSandboxPaymentProvider({
    ...config,
    name: "stripe",
  });
}
