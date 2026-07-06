import type { Enums } from "@/shared/database.types";

export type FinanceMetrics = {
  availableBalanceCents: number;
  chargebacksCents: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  pendingBalanceCents: number;
  refundsCents: number;
  totalFeesPaidCents: number;
  totalReceivedCents: number;
  totalWithdrawnCents: number;
};

export type FinanceWalletTransaction = {
  amountCents: number;
  createdAt: string;
  description: string;
  grossAmountCents: number;
  id: string;
  status: Enums<"wallet_transaction_status">;
  type: Enums<"wallet_transaction_type">;
};

export type FinancePageData =
  | {
      metrics: FinanceMetrics;
      state: "missing_producer";
      transactions: [];
    }
  | {
      metrics: FinanceMetrics;
      state: "ready";
      transactions: FinanceWalletTransaction[];
    };
