import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CheckoutProduct,
  PublicCheckoutProduct,
} from "@/modules/checkout/domain/types";
import type { Database } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;

function repositoryError(message: string): Error {
  return new Error(message);
}

export async function listCheckoutProductsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<CheckoutProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, producer_id, name, slug, description, price_cents, currency, status, created_at, updated_at",
    )
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw repositoryError("Não foi possível carregar os links de checkout.");
  }

  return data ?? [];
}

export async function findPublicCheckoutProductBySlug(
  supabase: DatabaseClient,
  slug: string,
): Promise<PublicCheckoutProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, producer_id, name, slug, description, price_cents, currency, status, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
