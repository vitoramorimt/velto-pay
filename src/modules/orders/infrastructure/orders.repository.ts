import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ProducerOrder,
  ProducerOrderFilters,
} from "@/modules/orders/domain/types";
import type { Database } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;
type SupabaseReadError = {
  code?: string;
  message?: string;
};

const ORDER_PAGE_SIZE = 1000;
const ORDER_SELECT =
  "id, producer_id, customer_id, product_id, status, payment_method, total_cents, currency, metadata, created_at, updated_at";
const ORDER_FALLBACK_SELECT =
  "id, producer_id, customer_id, product_id, status, total_cents, currency, created_at, updated_at";

function repositoryError(message: string): Error {
  return new Error(message);
}

function shouldReturnEmptyRows(error: SupabaseReadError): boolean {
  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "42501" ||
    error.code === "42P01" ||
    message.includes("permission denied") ||
    message.includes("does not exist")
  );
}

function shouldRetryWithoutOptionalOrderColumns(
  error: SupabaseReadError,
): boolean {
  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    message.includes("payment_method") ||
    message.includes("metadata") ||
    message.includes("schema cache")
  );
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

function createFallbackOrdersQuery(
  supabase: DatabaseClient,
  producerId: string,
  filters: ProducerOrderFilters,
) {
  let query = supabase
    .from("orders")
    .select(ORDER_FALLBACK_SELECT)
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (filters.createdAfter) {
    query = query.gte("created_at", filters.createdAfter);
  }

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  return query;
}

function normalizeFallbackOrders(
  orders: Array<Omit<ProducerOrder, "metadata" | "payment_method">>,
): ProducerOrder[] {
  return orders.map((order) => ({
    ...order,
    metadata: {},
    payment_method: null,
  }));
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

    if (error && shouldRetryWithoutOptionalOrderColumns(error)) {
      const fallbackFilters = {
        ...filters,
        method: undefined,
      };
      const { data: fallbackData, error: fallbackError } =
        await createFallbackOrdersQuery(
          supabase,
          producerId,
          fallbackFilters,
        ).range(from, to);

      if (fallbackError) {
        if (shouldReturnEmptyRows(fallbackError)) {
          return [];
        }

        throw repositoryError("Não foi possível carregar os pedidos.");
      }

      const fallbackOrders = normalizeFallbackOrders(fallbackData ?? []);

      orders.push(...fallbackOrders);

      if (fallbackOrders.length < ORDER_PAGE_SIZE) {
        break;
      }

      from += ORDER_PAGE_SIZE;
      continue;
    }

    if (error) {
      if (shouldReturnEmptyRows(error)) {
        return [];
      }

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
