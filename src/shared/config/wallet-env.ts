import "server-only";

import { z } from "zod";

const walletEnvSchema = z.object({
  PLATFORM_FEE_FIXED_AMOUNT: z.string().optional(),
  PLATFORM_FEE_PERCENTAGE: z.string().optional(),
  WALLET_SETTLEMENT_DAYS: z.string().optional(),
});

function parseCurrencyToCents(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/[^\d.,-]/g, "").trim();

  if (!normalized || normalized.startsWith("-")) {
    return 0;
  }

  const lastCommaIndex = normalized.lastIndexOf(",");
  const lastDotIndex = normalized.lastIndexOf(".");
  const separatorIndex = Math.max(lastCommaIndex, lastDotIndex);

  if (separatorIndex === -1) {
    return Number.parseInt(normalized.replace(/\D/g, ""), 10) || 0;
  }

  const integerPart = normalized.slice(0, separatorIndex).replace(/\D/g, "");
  const decimalPart = normalized.slice(separatorIndex + 1).replace(/\D/g, "");

  if (!integerPart || decimalPart.length > 2) {
    return 0;
  }

  return Number(integerPart) * 100 + Number(decimalPart.padEnd(2, "0"));
}

function parsePercentage(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value.replace(",", "."));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseSettlementDays(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

const parsedWalletEnv = walletEnvSchema.parse({
  PLATFORM_FEE_FIXED_AMOUNT: process.env.PLATFORM_FEE_FIXED_AMOUNT,
  PLATFORM_FEE_PERCENTAGE: process.env.PLATFORM_FEE_PERCENTAGE,
  WALLET_SETTLEMENT_DAYS: process.env.WALLET_SETTLEMENT_DAYS,
});

export const walletEnv = {
  platformFeeFixedAmountCents: parseCurrencyToCents(
    parsedWalletEnv.PLATFORM_FEE_FIXED_AMOUNT,
  ),
  platformFeePercentage: parsePercentage(
    parsedWalletEnv.PLATFORM_FEE_PERCENTAGE,
  ),
  settlementDays: parseSettlementDays(parsedWalletEnv.WALLET_SETTLEMENT_DAYS),
};
