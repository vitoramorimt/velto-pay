import { describe, expect, it } from "vitest";

import {
  createWithdrawalRequestDefaults,
  reserveWithdrawalBalance,
  validateWithdrawalAmount,
} from "@/modules/wallet/domain/withdrawals";

describe("wallet withdrawals", () => {
  it("accepts withdrawals within available balance", () => {
    expect(
      validateWithdrawalAmount({
        amountCents: 2500,
        availableBalanceCents: 3000,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects zero or negative withdrawals", () => {
    expect(
      validateWithdrawalAmount({
        amountCents: 0,
        availableBalanceCents: 3000,
      }),
    ).toMatchObject({ ok: false });
  });

  it("rejects withdrawals above available balance", () => {
    expect(
      validateWithdrawalAmount({
        amountCents: 3001,
        availableBalanceCents: 3000,
      }),
    ).toMatchObject({ ok: false });
  });

  it("reserves available balance for a valid withdrawal", () => {
    expect(reserveWithdrawalBalance(3000, 1200)).toBe(1800);
  });

  it("prefills withdrawal fields with default Pix settings", () => {
    expect(
      createWithdrawalRequestDefaults({
        default_bank_name: "Velto Bank",
        default_holder_document: "12345678901",
        default_holder_name: "Velto Producer",
        default_pix_key: "produtor@velto.test",
        default_pix_key_type: "email",
      }),
    ).toMatchObject({
      bankName: "Velto Bank",
      holderDocument: "12345678901",
      holderName: "Velto Producer",
      pixKey: "produtor@velto.test",
      pixKeyType: "email",
    });
  });
});
