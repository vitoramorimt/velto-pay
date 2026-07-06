import { describe, expect, it } from "vitest";

import {
  calculateCheckoutTotal,
  calculateDiscountCents,
  MINIMUM_CHECKOUT_TOTAL_CENTS,
} from "@/modules/checkout/domain/pricing";
import type {
  CheckoutCoupon,
  CheckoutOffer,
} from "@/modules/checkout/domain/types";

const percentageCoupon: CheckoutCoupon = {
  code: "VELTO10",
  discount_type: "percentage",
  discount_value: 1000,
  expires_at: null,
  id: "coupon-percentage",
  max_redemptions: null,
};

const fixedCoupon: CheckoutCoupon = {
  code: "VELTO20",
  discount_type: "fixed",
  discount_value: 2000,
  expires_at: null,
  id: "coupon-fixed",
  max_redemptions: null,
};

const bump: CheckoutOffer = {
  amount_cents: 1500,
  badge_text: "Mais vendido",
  currency: "BRL",
  description: "Oferta adicional",
  id: "bump-1",
  offer_type: "order_bump",
  position: 0,
  title: "Mentoria bônus",
};

describe("checkout pricing", () => {
  it("calculates percentage discounts in basis points", () => {
    expect(
      calculateDiscountCents({
        coupon: percentageCoupon,
        subtotalCents: 10000,
      }),
    ).toBe(1000);
  });

  it("caps discounts at the minimum checkout total", () => {
    expect(
      calculateDiscountCents({
        coupon: fixedCoupon,
        subtotalCents: 1500,
      }),
    ).toBe(1500 - MINIMUM_CHECKOUT_TOTAL_CENTS);
  });

  it("adds order bumps before applying coupons", () => {
    expect(
      calculateCheckoutTotal({
        coupon: percentageCoupon,
        orderBumps: [bump],
        productPriceCents: 8500,
      }),
    ).toMatchObject({
      discountCents: 1000,
      subtotalCents: 10000,
      totalCents: 9000,
    });
  });
});
