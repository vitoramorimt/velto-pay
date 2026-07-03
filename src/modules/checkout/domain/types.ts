import type { Enums, Tables } from "@/shared/database.types";

export type CheckoutStatus = Enums<"checkout_status">;
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
  checkoutCreatedAt: string;
  checkoutId: string;
  checkoutName: string;
  checkoutSlug: string;
  checkoutStatus: CheckoutStatus;
  checkoutUpdatedAt: string;
  link: string;
  product: CheckoutProduct;
};

export type PublicCheckout = {
  checkoutId: string;
  checkoutSlug: string;
  description: string | null;
  product: CheckoutProduct;
};
