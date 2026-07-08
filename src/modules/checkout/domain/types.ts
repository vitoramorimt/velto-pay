import type { Enums, Tables } from "@/shared/database.types";
import type { CheckoutBadge } from "@/modules/checkout/domain/badges";

export type CheckoutStatus = Enums<"checkout_status">;
export type CheckoutTheme = "dark" | "light";
export type CheckoutProduct = Pick<
  Tables<"products">,
  | "created_at"
  | "currency"
  | "description"
  | "id"
  | "image_url"
  | "name"
  | "price_cents"
  | "producer_id"
  | "slug"
  | "status"
  | "updated_at"
>;

export type CheckoutLink = {
  checkoutBadges: CheckoutBadge[];
  checkoutCreatedAt: string;
  checkoutDescription: string | null;
  checkoutHeadline: string | null;
  checkoutId: string;
  checkoutName: string;
  checkoutPrimaryColor: string | null;
  checkoutSlug: string;
  checkoutStatus: CheckoutStatus;
  checkoutTheme: CheckoutTheme;
  checkoutUpdatedAt: string;
  link: string;
  product: CheckoutProduct;
};

export type CheckoutOffer = Pick<
  Tables<"checkout_offers">,
  | "amount_cents"
  | "badge_text"
  | "currency"
  | "description"
  | "id"
  | "offer_type"
  | "position"
  | "title"
>;

export type CheckoutPixel = Pick<
  Tables<"checkout_pixels">,
  "id" | "pixel_id" | "provider"
>;

export type CheckoutCoupon = Pick<
  Tables<"coupons">,
  | "code"
  | "discount_type"
  | "discount_value"
  | "expires_at"
  | "id"
  | "max_redemptions"
>;

export type CheckoutUtm = {
  campaign?: string | null;
  content?: string | null;
  medium?: string | null;
  source?: string | null;
  term?: string | null;
};

export type CheckoutOfferGroups = {
  downsells: CheckoutOffer[];
  orderBumps: CheckoutOffer[];
  upsells: CheckoutOffer[];
};

export type PublicCheckout = {
  badges: CheckoutBadge[];
  checkoutId: string;
  checkoutSlug: string;
  description: string | null;
  headline: string | null;
  offers: CheckoutOfferGroups;
  pixels: CheckoutPixel[];
  primaryColor: string | null;
  product: CheckoutProduct;
  theme: CheckoutTheme;
};

export type CheckoutQuote = {
  coupon: CheckoutCoupon | null;
  discountCents: number;
  orderBumps: CheckoutOffer[];
  productPriceCents: number;
  subtotalCents: number;
  totalCents: number;
};

export type CheckoutSuccessOffer = {
  amount_cents: number;
  badge_text: string | null;
  currency: string;
  description: string | null;
  id: string;
  title: string;
  type: "upsell" | "downsell";
};

export type CheckoutSuccessContext = {
  checkout_id: string;
  currency: string;
  offers: CheckoutSuccessOffer[];
  order_id: string;
  product_name: string;
  total_cents: number;
};
