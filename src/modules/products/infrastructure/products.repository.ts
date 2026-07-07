import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  appendSlugSuffix,
  createProductSlug,
  createRandomProductSlug,
} from "@/modules/products/domain/slug";
import type { Product, Producer } from "@/modules/products/domain/types";
import type { Database } from "@/shared/database.types";
import {
  devBypassProducer,
  isDevBypassEnabled,
  mockProductsStore,
} from "@/shared/dev/mock-data-store";

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
  if (isDevBypassEnabled()) {
    return devBypassProducer;
  }

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
  if (isDevBypassEnabled()) {
    return mockProductsStore
      .list()
      .filter((product) => product.producer_id === producerId);
  }

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
  if (isDevBypassEnabled()) {
    const product = mockProductsStore.findById(productId);

    return product && product.producer_id === producerId ? product : null;
  }

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
  slug: string,
  productIdToIgnore?: string,
): Promise<boolean> {
  if (isDevBypassEnabled()) {
    return mockProductsStore.slugExists(slug, productIdToIgnore);
  }

  let query = supabase.from("products").select("id").eq("slug", slug).limit(1);

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
  name: string,
  preferredSlug?: string,
  productIdToIgnore?: string,
): Promise<string> {
  const baseSlug = createProductSlug(preferredSlug || name);
  let candidate = baseSlug;

  for (let suffix = 2; suffix <= 50; suffix += 1) {
    const exists = await productSlugExists(
      supabase,
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

export async function resolveUniqueRandomProductSlug(
  supabase: DatabaseClient,
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = createRandomProductSlug();
    const exists = await productSlugExists(supabase, candidate);

    if (!exists) {
      return candidate;
    }
  }

  throw repositoryError("Não foi possível gerar um link único para o produto.");
}

export async function insertProduct(
  supabase: DatabaseClient,
  product: ProductInsert,
): Promise<Product> {
  if (isDevBypassEnabled()) {
    return mockProductsStore.insert(product);
  }

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
  if (isDevBypassEnabled()) {
    const existing = mockProductsStore.findById(productId);

    if (!existing || existing.producer_id !== producerId) {
      throw repositoryError("Não foi possível atualizar o produto.");
    }

    return mockProductsStore.update(productId, product) ?? existing;
  }

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
