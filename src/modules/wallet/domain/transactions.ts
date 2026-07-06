import type { WalletSettlement } from "@/modules/wallet/domain/fees";
import type { Enums } from "@/shared/database.types";

export type WalletTransactionDraft = WalletSettlement & {
  netAmountCents: number;
  status: Enums<"wallet_transaction_status">;
  type: Enums<"wallet_transaction_type">;
};

export function createSaleWalletTransactionDraft(
  settlement: WalletSettlement,
  settlementDays: number,
): WalletTransactionDraft {
  return {
    ...settlement,
    status: settlementDays > 0 ? "pending" : "available",
    type: "sale",
  };
}

export function createRefundWalletTransactionDraft(
  sale: WalletTransactionDraft,
): WalletTransactionDraft {
  return {
    gatewayFeeAmountCents: sale.gatewayFeeAmountCents,
    grossAmountCents: sale.grossAmountCents,
    netAmountCents: -Math.abs(sale.netAmountCents),
    platformFeeAmountCents: sale.platformFeeAmountCents,
    status: "available",
    type: "refund",
  };
}

export function createChargebackWalletTransactionDraft(
  sale: WalletTransactionDraft,
): WalletTransactionDraft {
  return {
    ...createRefundWalletTransactionDraft(sale),
    type: "chargeback",
  };
}

export function shouldSkipProcessedPaymentEvent(
  existingTypes: Array<Enums<"wallet_transaction_type">>,
  nextType: Enums<"wallet_transaction_type">,
): boolean {
  return existingTypes.includes(nextType);
}
