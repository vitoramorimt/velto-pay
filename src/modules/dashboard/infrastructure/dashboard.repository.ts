import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;
export type DashboardOrder = Pick<
  Tables<"orders">,
  | "created_at"
  | "currency"
  | "customer_id"
  | "id"
  | "product_id"
  | "status"
  | "total_cents"
>;
type ProductSummary = Pick<Tables<"products">, "id" | "name">;

const DASHBOARD_ORDER_PAGE_SIZE = 1000;

function repositoryError(message: string): Error {
  return new Error(message);
}

export async function listDashboardOrdersByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<DashboardOrder[]> {
  const orders: DashboardOrder[] = [];
  let from = 0;

  while (true) {
    const to = from + DASHBOARD_ORDER_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, customer_id, product_id, status, total_cents, currency, created_at",
      )
      .eq("producer_id", producerId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw repositoryError("Nao foi possivel carregar os dados do dashboard.");
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
): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("producer_id", producerId)
    .eq("status", "active");

  if (error) {
    throw repositoryError("Nao foi possivel carregar os produtos ativos.");
  }

  return count ?? 0;
}

export async function listProductSummariesByIds(
  supabase: DatabaseClient,
  producerId: string,
  productIds: string[],
): Promise<ProductSummary[]> {
  if (productIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("producer_id", producerId)
    .in("id", productIds);

  if (error) {
    throw repositoryError("Nao foi possivel carregar os produtos das vendas.");
  }

  return data ?? [];
}
