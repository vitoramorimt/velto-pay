import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ProducerOrder,
  ProducerOrderFilters,
} from "@/modules/orders/domain/types";
import type { Database } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;

const ORDER_PAGE_SIZE = 1000;
const ORDER_SELECT =
  "id, producer_id, customer_id, product_id, status, payment_method, total_cents, currency, metadata, created_at, updated_at";

function repositoryError(message: string): Error {
  return new Error(message);
}

function createOrdersQuery(
  supabase: DatabaseClient,
  producerId: string,
  filters: ProducerOrderFilters,
) {
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (filters.createdAfter) {
    query = query.gte("created_at", filters.createdAfter);
  }

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  if (filters.method) {
    query = query.eq("payment_method", filters.method);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  return query;
}

export async function listOrdersByProducerId(
  supabase: DatabaseClient,
  producerId: string,
  filters: ProducerOrderFilters = {},
): Promise<ProducerOrder[]> {
  const orders: ProducerOrder[] = [];
  let from = 0;

  while (true) {
    const to = from + ORDER_PAGE_SIZE - 1;
    const { data, error } = await createOrdersQuery(
      supabase,
      producerId,
      filters,
    ).range(from, to);

    if (error) {
      console.error("Failed to list producer orders", {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
        producerId,
      });
      throw repositoryError("Não foi possível carregar os pedidos.");
    }

    orders.push(...(data ?? []));

    if (!data || data.length < ORDER_PAGE_SIZE) {
      break;
    }

    from += ORDER_PAGE_SIZE;
  }

  return orders;
}
