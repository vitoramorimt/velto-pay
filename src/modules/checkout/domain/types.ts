import type { Enums, Tables } from "@/shared/database.types";

export type CheckoutStatus = Enums<"checkout_status">;
export type CheckoutProduct = Pick<
  Tables<"products">,
  | "created_at"
  | "currency"
  | "description"
  | "id"
  | "name"
  | "price_cents"
  | "producer_id"
  | "slug"
  | "status"
  | "updated_at"
>;

export type CheckoutLink = {
  checkoutId: string | null;
  checkoutStatus: CheckoutStatus;
  checkoutUpdatedAt: string;
  link: string;
  product: CheckoutProduct;
};

export type PublicCheckoutProduct = CheckoutProduct;
