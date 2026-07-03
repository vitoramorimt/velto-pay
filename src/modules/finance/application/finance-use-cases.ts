import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import type {
  FinanceLedgerEntry,
  FinanceMetrics,
  FinancePageData,
} from "@/modules/finance/domain/types";
import {
  type FinanceLedgerRow,
  listLedgerEntriesByProducerId,
} from "@/modules/finance/infrastructure/finance.repository";
import { listOrdersByProducerId } from "@/modules/orders/infrastructure/orders.repository";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

const emptyMetrics: FinanceMetrics = {
  approvedSales: 0,
  availableBalanceCents: 0,
  blockedBalanceCents: 0,
  chargebacksCents: 0,
  grossRevenueCents: 0,
  netRevenueCents: 0,
  refundsCents: 0,
};

function getLedgerBalance(
  rows: FinanceLedgerRow[],
  availability: "available" | "blocked",
): number {
  const now = new Date();

  return rows.reduce((total, entry) => {
    const isBlocked = Boolean(
      entry.available_at && new Date(entry.available_at) > now,
    );

    if (availability === "available" && isBlocked) {
      return total;
    }

    if (availability === "blocked" && !isBlocked) {
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
    listOrdersByProducerId(supabase, producer.id),
    listLedgerEntriesByProducerId(supabase, producer.id),
  ]);
  const paidOrders = orders.filter((order) => order.status === "paid");
  const refundedOrders = orders.filter((order) => order.status === "refunded");
  const chargebackOrders = orders.filter(
    (order) => order.status === "chargeback",
  );
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
      availableBalanceCents: getLedgerBalance(ledgerRows, "available"),
      blockedBalanceCents: getLedgerBalance(ledgerRows, "blocked"),
      chargebacksCents: chargebackOrders.reduce(
        (total, order) => total + order.total_cents,
        0,
      ),
      grossRevenueCents: paidOrders.reduce(
        (total, order) => total + order.total_cents,
        0,
      ),
      netRevenueCents:
        paidOrders.reduce((total, order) => total + order.total_cents, 0) -
        refundedOrders.reduce((total, order) => total + order.total_cents, 0) -
        chargebackOrders.reduce(
          (total, order) => total + order.total_cents,
          0,
        ),
      refundsCents: refundedOrders.reduce(
        (total, order) => total + order.total_cents,
        0,
      ),
    },
    state: "ready",
  };
}
