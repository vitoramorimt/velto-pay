import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;
type SupabaseReadError = {
  code?: string;
  message?: string;
};

export type FinanceOrder = Pick<
  Tables<"orders">,
  "created_at" | "currency" | "id" | "status" | "total_cents"
>;
export type FinanceLedgerRow = Pick<
  Tables<"ledger_entries">,
  | "amount_cents"
  | "available_at"
  | "created_at"
  | "description"
  | "direction"
  | "entry_type"
  | "id"
>;

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

export async function listFinanceOrdersByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<FinanceOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_cents, currency, created_at")
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    if (shouldReturnEmptyRows(error)) {
      return [];
    }

    throw repositoryError("Não foi possível carregar os pedidos financeiros.");
  }

  return data ?? [];
}

export async function listLedgerEntriesByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<FinanceLedgerRow[]> {
  const { data, error } = await supabase
    .from("ledger_entries")
    .select(
      "id, amount_cents, available_at, created_at, description, direction, entry_type",
    )
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    if (shouldReturnEmptyRows(error)) {
      return [];
    }

    throw repositoryError("Não foi possível carregar o histórico financeiro.");
  }

  return data ?? [];
}
