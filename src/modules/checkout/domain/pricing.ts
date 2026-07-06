import type {
  CheckoutCoupon,
  CheckoutOffer,
} from "@/modules/checkout/domain/types";

export const MINIMUM_CHECKOUT_TOTAL_CENTS = 100;

export function calculateDiscountCents({
  coupon,
  subtotalCents,
}: {
  coupon: CheckoutCoupon | null;
  subtotalCents: number;
}): number {
  if (!coupon) {
    return 0;
  }

  const rawDiscount =
    coupon.discount_type === "percentage"
      ? Math.floor((subtotalCents * coupon.discount_value) / 10000)
      : coupon.discount_value;

  return Math.min(
    Math.max(rawDiscount, 0),
    Math.max(subtotalCents - MINIMUM_CHECKOUT_TOTAL_CENTS, 0),
  );
}

export function calculateCheckoutTotal({
  coupon,
  orderBumps,
  productPriceCents,
}: {
  coupon: CheckoutCoupon | null;
  orderBumps: CheckoutOffer[];
  productPriceCents: number;
}) {
  const bumpsTotalCents = orderBumps.reduce(
    (total, offer) => total + offer.amount_cents,
    0,
  );
  const subtotalCents = productPriceCents + bumpsTotalCents;
  const discountCents = calculateDiscountCents({ coupon, subtotalCents });
  const totalCents = Math.max(
    subtotalCents - discountCents,
    MINIMUM_CHECKOUT_TOTAL_CENTS,
  );

  return {
    discountCents,
    subtotalCents,
    totalCents,
  };
}
