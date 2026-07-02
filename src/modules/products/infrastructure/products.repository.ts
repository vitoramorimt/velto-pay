import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  appendSlugSuffix,
  createProductSlug,
} from "@/modules/products/domain/slug";
import type { Product, Producer } from "@/modules/products/domain/types";
import type { Database } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

function repositoryError(message: string): Error {
  return new Error(message);
}

export async function findProducerByUserId(
  supabase: DatabaseClient,
  userId: string,
): Promise<Producer | null> {
  const { data, error } = await supabase
    .from("producers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw repositoryError("Não foi possível carregar o produtor.");
  }

  return data;
}

export async function listProductsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw repositoryError("Não foi possível listar os produtos.");
  }

  return data ?? [];
}

export async function findProductByProducerId(
  supabase: DatabaseClient,
  productId: string,
  producerId: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("producer_id", producerId)
    .maybeSingle();

  if (error) {
    throw repositoryError("Não foi possível carregar o produto.");
  }

  return data;
}

async function productSlugExists(
  supabase: DatabaseClient,
  producerId: string,
  slug: string,
  productIdToIgnore?: string,
): Promise<boolean> {
  let query = supabase
    .from("products")
    .select("id")
    .eq("producer_id", producerId)
    .eq("slug", slug)
    .limit(1);

  if (productIdToIgnore) {
    query = query.neq("id", productIdToIgnore);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw repositoryError("Não foi possível validar o slug do produto.");
  }

  return Boolean(data);
}

export async function resolveUniqueProductSlug(
  supabase: DatabaseClient,
  producerId: string,
  name: string,
  preferredSlug?: string,
  productIdToIgnore?: string,
): Promise<string> {
  const baseSlug = createProductSlug(preferredSlug || name);
  let candidate = baseSlug;

  for (let suffix = 2; suffix <= 50; suffix += 1) {
    const exists = await productSlugExists(
      supabase,
      producerId,
      candidate,
      productIdToIgnore,
    );

    if (!exists) {
      return candidate;
    }

    candidate = appendSlugSuffix(baseSlug, suffix);
  }

  throw repositoryError("Não foi possível gerar um slug único para o produto.");
}

export async function insertProduct(
  supabase: DatabaseClient,
  product: ProductInsert,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select("*")
    .single();

  if (error) {
    throw repositoryError("Não foi possível criar o produto.");
  }

  return data;
}

export async function updateProductByProducerId(
  supabase: DatabaseClient,
  productId: string,
  producerId: string,
  product: ProductUpdate,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", productId)
    .eq("producer_id", producerId)
    .select("*")
    .single();

  if (error) {
    throw repositoryError("Não foi possível atualizar o produto.");
  }

  return data;
}
