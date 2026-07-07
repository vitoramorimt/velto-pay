import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/shared/database.types";
import { isDevBypassEnabled, mockProductsStore } from "@/shared/dev/mock-data-store";

type DatabaseClient = SupabaseClient<Database>;
export type DashboardOrder = Pick<
  Tables<"orders">,
  | "created_at"
  | "currency"
  | "customer_id"
  | "id"
  | "metadata"
  | "payment_method"
  | "product_id"
  | "status"
  | "total_cents"
>;
export type DashboardProductSummary = Pick<
  Tables<"products">,
  "id" | "name" | "status"
>;

type DashboardOrderFilters = {
  createdAfter?: string;
  method?: Tables<"orders">["payment_method"];
  productId?: string;
  status?: Tables<"orders">["status"];
};

const DASHBOARD_ORDER_PAGE_SIZE = 1000;
const DASHBOARD_ORDER_SELECT =
  "id, customer_id, product_id, status, payment_method, total_cents, currency, metadata, created_at";

function repositoryError(message: string): Error {
  return new Error(message);
}

function createDashboardOrdersQuery(
  supabase: DatabaseClient,
  producerId: string,
  filters: DashboardOrderFilters,
) {
  let query = supabase
    .from("orders")
    .select(DASHBOARD_ORDER_SELECT)
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

export async function listDashboardOrdersByProducerId(
  supabase: DatabaseClient,
  producerId: string,
  filters: DashboardOrderFilters = {},
): Promise<DashboardOrder[]> {
  if (isDevBypassEnabled()) {
    return [];
  }

  const orders: DashboardOrder[] = [];
  let from = 0;

  while (true) {
    const to = from + DASHBOARD_ORDER_PAGE_SIZE - 1;
    const { data, error } = await createDashboardOrdersQuery(
      supabase,
      producerId,
      filters,
    ).range(from, to);

    if (error) {
      throw repositoryError("Não foi possível carregar os dados do dashboard.");
    }

    orders.push(...(data ?? []));

    if (!data || data.length < DASHBOARD_ORDER_PAGE_SIZE) {
      break;
    }

    from += DASHBOARD_ORDER_PAGE_SIZE;
  }

  return orders;
}

export async function countActiveProductsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
  productId?: string,
): Promise<number> {
  if (isDevBypassEnabled()) {
    return mockProductsStore
      .list()
      .filter(
        (product) =>
          product.producer_id === producerId &&
          product.status === "active" &&
          (!productId || product.id === productId),
      ).length;
  }

  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("producer_id", producerId)
    .eq("status", "active");

  if (productId) {
    query = query.eq("id", productId);
  }

  const { count, error } = await query;

  if (error) {
    throw repositoryError("Não foi possível carregar os produtos ativos.");
  }

  return count ?? 0;
}

export async function listProductSummariesByIds(
  supabase: DatabaseClient,
  producerId: string,
  productIds: string[],
): Promise<DashboardProductSummary[]> {
  if (productIds.length === 0) {
    return [];
  }

  if (isDevBypassEnabled()) {
    return mockProductsStore
      .list()
      .filter(
        (product) =>
          product.producer_id === producerId && productIds.includes(product.id),
      )
      .map(({ id, name, status }) => ({ id, name, status }));
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, status")
    .eq("producer_id", producerId)
    .in("id", productIds);

  if (error) {
    throw repositoryError("Não foi possível carregar os produtos das vendas.");
  }

  return data ?? [];
}

export async function listDashboardProductOptionsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<DashboardProductSummary[]> {
  if (isDevBypassEnabled()) {
    return mockProductsStore
      .list()
      .filter((product) => product.producer_id === producerId)
      .map(({ id, name, status }) => ({ id, name, status }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, status")
    .eq("producer_id", producerId)
    .order("name", { ascending: true });

  if (error) {
    throw repositoryError("Não foi possível carregar os filtros de produtos.");
  }

  return data ?? [];
}
