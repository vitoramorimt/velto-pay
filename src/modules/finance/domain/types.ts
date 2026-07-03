import type { Enums } from "@/shared/database.types";

export type FinanceMetrics = {
  approvedSales: number;
  availableBalanceCents: number;
  blockedBalanceCents: number;
  chargebacksCents: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  refundsCents: number;
};

export type FinanceLedgerEntry = {
  amountCents: number;
  createdAt: string;
  description: string;
  direction: Enums<"ledger_entry_direction">;
  id: string;
  type: Enums<"ledger_entry_type">;
};

export type FinancePageData =
  | {
      entries: [];
      metrics: FinanceMetrics;
      state: "missing_producer";
    }
  | {
      entries: FinanceLedgerEntry[];
      metrics: FinanceMetrics;
      state: "ready";
    };
