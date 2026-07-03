import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import type {
  FinanceLedgerEntry,
  FinanceMetrics,
  FinancePageData,
} from "@/modules/finance/domain/types";
import {
  type FinanceLedgerRow,
  listFinanceOrdersByProducerId,
  listLedgerEntriesByProducerId,
} from "@/modules/finance/infrastructure/finance.repository";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

const emptyMetrics: FinanceMetrics = {
  approvedSales: 0,
  availableBalanceCents: 0,
  refundsCents: 0,
  totalRevenueCents: 0,
};

function getAvailableBalance(rows: FinanceLedgerRow[]): number {
  const now = new Date();

  return rows.reduce((total, entry) => {
    if (entry.available_at && new Date(entry.available_at) > now) {
      return total;
    }

    if (entry.direction === "credit") {
      return total + entry.amount_cents;
    }

    return total - entry.amount_cents;
  }, 0);
}

export async function getFinancePageData(): Promise<FinancePageData> {
  const user = await requireAuthenticatedUser("/dashboard/financeiro");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    return {
      entries: [],
      metrics: emptyMetrics,
      state: "missing_producer",
    };
  }

  const [orders, ledgerRows] = await Promise.all([
    listFinanceOrdersByProducerId(supabase, producer.id),
    listLedgerEntriesByProducerId(supabase, producer.id),
  ]);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const refundedOrders = orders.filter((order) => order.status === "refunded");
  const entries: FinanceLedgerEntry[] = ledgerRows.map((entry) => ({
    amountCents: entry.amount_cents,
    createdAt: entry.created_at,
    description: entry.description ?? "Movimentação financeira",
    direction: entry.direction,
    id: entry.id,
    type: entry.entry_type,
  }));

  return {
    entries,
    metrics: {
      approvedSales: paidOrders.length,
      availableBalanceCents: getAvailableBalance(ledgerRows),
      refundsCents: refundedOrders.reduce(
        (total, order) => total + order.total_cents,
        0,
      ),
      totalRevenueCents: paidOrders.reduce(
        (total, order) => total + order.total_cents,
        0,
      ),
    },
    state: "ready",
  };
}
