import { describe, expect, it } from "vitest";

import {
  calculatePlatformFee,
  calculateWalletSettlement,
} from "@/modules/wallet/domain/fees";

describe("wallet fee calculations", () => {
  it("calculates a fixed platform fee", () => {
    expect(
      calculatePlatformFee({
        fixedAmountCents: 249,
        grossAmountCents: 2790,
      }),
    ).toBe(249);
  });

  it("calculates a percentage platform fee", () => {
    expect(
      calculatePlatformFee({
        grossAmountCents: 10000,
        percentage: 10,
      }),
    ).toBe(1000);
  });

  it("calculates fixed plus percentage fee", () => {
    expect(
      calculatePlatformFee({
        fixedAmountCents: 249,
        grossAmountCents: 10000,
        percentage: 5,
      }),
    ).toBe(749);
  });

  it("returns the producer net amount after fees", () => {
    expect(
      calculateWalletSettlement({
        fixedAmountCents: 249,
        grossAmountCents: 2790,
        percentage: 0,
      }),
    ).toMatchObject({
      gatewayFeeAmountCents: 0,
      grossAmountCents: 2790,
      netAmountCents: 2541,
      platformFeeAmountCents: 249,
    });
  });

  it("caps total fees to the gross amount", () => {
    expect(
      calculateWalletSettlement({
        fixedAmountCents: 10_000,
        gatewayFeeAmountCents: 10_000,
        grossAmountCents: 2790,
        percentage: 10,
      }).netAmountCents,
    ).toBe(0);
  });
});
