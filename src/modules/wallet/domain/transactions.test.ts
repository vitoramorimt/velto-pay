import { describe, expect, it } from "vitest";

import { calculateWalletSettlement } from "@/modules/wallet/domain/fees";
import {
  createChargebackWalletTransactionDraft,
  createRefundWalletTransactionDraft,
  createSaleWalletTransactionDraft,
  shouldSkipProcessedPaymentEvent,
} from "@/modules/wallet/domain/transactions";

describe("wallet transaction drafts", () => {
  const settlement = calculateWalletSettlement({
    fixedAmountCents: 249,
    grossAmountCents: 2790,
  });

  it("creates an available sale when settlement is immediate", () => {
    expect(createSaleWalletTransactionDraft(settlement, 0)).toMatchObject({
      netAmountCents: 2541,
      status: "available",
      type: "sale",
    });
  });

  it("creates a pending sale when settlement has a delay", () => {
    expect(createSaleWalletTransactionDraft(settlement, 7)).toMatchObject({
      status: "pending",
      type: "sale",
    });
  });

  it("creates a refund transaction that reverses the producer net amount", () => {
    const sale = createSaleWalletTransactionDraft(settlement, 0);

    expect(createRefundWalletTransactionDraft(sale)).toMatchObject({
      netAmountCents: -2541,
      type: "refund",
    });
  });

  it("creates a chargeback transaction that reverses the producer net amount", () => {
    const sale = createSaleWalletTransactionDraft(settlement, 0);

    expect(createChargebackWalletTransactionDraft(sale)).toMatchObject({
      netAmountCents: -2541,
      type: "chargeback",
    });
  });

  it("detects idempotent processed payment events", () => {
    expect(shouldSkipProcessedPaymentEvent(["sale"], "sale")).toBe(true);
    expect(shouldSkipProcessedPaymentEvent(["sale"], "refund")).toBe(false);
  });
});
