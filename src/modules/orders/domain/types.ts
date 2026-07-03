import type { Enums, Json, Tables } from "@/shared/database.types";

export type OrderStatus = Enums<"order_status">;
export type OrderPaymentMethod = Enums<"payment_method">;

export type ProducerOrder = Pick<
  Tables<"orders">,
  | "created_at"
  | "currency"
  | "customer_id"
  | "id"
  | "metadata"
  | "payment_method"
  | "producer_id"
  | "product_id"
  | "status"
  | "total_cents"
  | "updated_at"
> & {
  customerEmail?: string | null;
  customerName?: string | null;
};

export type ProducerOrderFilters = {
  createdAfter?: string;
  method?: OrderPaymentMethod;
  productId?: string;
  status?: OrderStatus;
};

export type ProducerOrderSummary = {
  amountCents: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  id: string;
  metadata: Json;
  paymentMethod: OrderPaymentMethod | null;
  productId: string;
  status: OrderStatus;
};
