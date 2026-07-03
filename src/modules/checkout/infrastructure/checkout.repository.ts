import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CheckoutLink,
  CheckoutProduct,
  CheckoutStatus,
  PublicCheckout,
} from "@/modules/checkout/domain/types";
import type { Product } from "@/modules/products/domain/types";
import {
  appendSlugSuffix,
  createProductSlug,
} from "@/modules/products/domain/slug";
import type { Database } from "@/shared/database.types";

type DatabaseClient = SupabaseClient<Database>;
type CheckoutInsert = Database["public"]["Tables"]["checkouts"]["Insert"];
type CheckoutUpdate = Database["public"]["Tables"]["checkouts"]["Update"];
type CheckoutRow = Pick<
  Database["public"]["Tables"]["checkouts"]["Row"],
  | "created_at"
  | "description"
  | "headline"
  | "id"
  | "producer_id"
  | "product_id"
  | "published_at"
  | "slug"
  | "status"
  | "updated_at"
>;
type CheckoutWithProductRow = CheckoutRow & {
  product: CheckoutProduct | null;
};
type PublicCheckoutRow = Pick<
  CheckoutRow,
  "description" | "id" | "slug"
> & {
  product: CheckoutProduct | null;
};

function repositoryError(message: string): Error {
  return new Error(message);
}

function toCheckoutStatus(productStatus: Product["status"]): CheckoutStatus {
  if (productStatus === "active") {
    return "published";
  }

  if (productStatus === "draft") {
    return "draft";
  }

  return "disabled";
}

function toPublishedAt(status: CheckoutStatus, currentValue?: string | null) {
  if (status !== "published") {
    return null;
  }

  return currentValue ?? new Date().toISOString();
}

function toCheckoutLink(checkout: CheckoutWithProductRow): CheckoutLink | null {
  if (!checkout.product) {
    return null;
  }

  return {
    checkoutCreatedAt: checkout.created_at,
    checkoutId: checkout.id,
    checkoutName: checkout.headline ?? checkout.product.name,
    checkoutSlug: checkout.slug,
    checkoutStatus: checkout.status,
    checkoutUpdatedAt: checkout.updated_at,
    link: "",
    product: checkout.product,
  };
}

async function checkoutSlugExists(
  supabase: DatabaseClient,
  slug: string,
  checkoutIdToIgnore?: string,
): Promise<boolean> {
  let query = supabase.from("checkouts").select("id").eq("slug", slug).limit(1);

  if (checkoutIdToIgnore) {
    query = query.neq("id", checkoutIdToIgnore);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw repositoryError("Não foi possível validar o slug do checkout.");
  }

  return Boolean(data);
}

async function resolveUniqueCheckoutSlug(
  supabase: DatabaseClient,
  slug: string,
  checkoutIdToIgnore?: string,
): Promise<string> {
  const baseSlug = createProductSlug(slug);
  let candidate = baseSlug;

  for (let suffix = 2; suffix <= 50; suffix += 1) {
    const exists = await checkoutSlugExists(
      supabase,
      candidate,
      checkoutIdToIgnore,
    );

    if (!exists) {
      return candidate;
    }

    candidate = appendSlugSuffix(baseSlug, suffix);
  }

  throw repositoryError("Não foi possível gerar um slug único de checkout.");
}

async function findCheckoutByProductId(
  supabase: DatabaseClient,
  productId: string,
): Promise<CheckoutRow | null> {
  const { data, error } = await supabase
    .from("checkouts")
    .select(
      "id, producer_id, product_id, slug, status, headline, description, published_at, created_at, updated_at",
    )
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    throw repositoryError("Não foi possível carregar o checkout do produto.");
  }

  return data;
}

export async function ensureCheckoutForProduct(
  supabase: DatabaseClient,
  product: Product,
): Promise<CheckoutRow> {
  const existingCheckout = await findCheckoutByProductId(supabase, product.id);
  const status = toCheckoutStatus(product.status);
  const slug = await resolveUniqueCheckoutSlug(
    supabase,
    product.slug,
    existingCheckout?.id,
  );
  const checkoutPayload: CheckoutInsert | CheckoutUpdate = {
    description: product.description,
    headline: product.name,
    producer_id: product.producer_id,
    product_id: product.id,
    published_at: toPublishedAt(status, existingCheckout?.published_at),
    slug,
    status,
  };

  if (existingCheckout) {
    const { data, error } = await supabase
      .from("checkouts")
      .update(checkoutPayload)
      .eq("id", existingCheckout.id)
      .eq("producer_id", product.producer_id)
      .select(
        "id, producer_id, product_id, slug, status, headline, description, published_at, created_at, updated_at",
      )
      .single();

    if (error) {
      throw repositoryError("Não foi possível atualizar o checkout.");
    }

    return data;
  }

  const { data, error } = await supabase
    .from("checkouts")
    .insert(checkoutPayload as CheckoutInsert)
    .select(
      "id, producer_id, product_id, slug, status, headline, description, published_at, created_at, updated_at",
    )
    .single();

  if (error) {
    throw repositoryError("Não foi possível criar o checkout.");
  }

  return data;
}

export async function listCheckoutsByProducerId(
  supabase: DatabaseClient,
  producerId: string,
): Promise<CheckoutLink[]> {
  const { data, error } = await supabase
    .from("checkouts")
    .select(
      "id, producer_id, product_id, slug, status, headline, description, published_at, created_at, updated_at, product:products(id, producer_id, name, slug, description, image_url, price_cents, currency, status, created_at, updated_at)",
    )
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw repositoryError("Não foi possível carregar os links de checkout.");
  }

  return ((data ?? []) as CheckoutWithProductRow[])
    .map(toCheckoutLink)
    .filter((checkout): checkout is CheckoutLink => Boolean(checkout));
}

export async function findPublicCheckoutBySlug(
  supabase: DatabaseClient,
  slug: string,
): Promise<PublicCheckout | null> {
  const { data, error } = await supabase
    .from("checkouts")
    .select(
      "id, slug, description, product:products!inner(id, producer_id, name, slug, description, image_url, price_cents, currency, status, created_at, updated_at)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("products.status", "active")
    .maybeSingle();

  if (error) {
    return null;
  }

  const checkout = data as PublicCheckoutRow | null;

  if (!checkout?.product) {
    return null;
  }

  return {
    checkoutId: checkout.id,
    checkoutSlug: checkout.slug,
    description: checkout.description,
    product: checkout.product,
  };
}

export async function deleteCheckoutByProducerId(
  supabase: DatabaseClient,
  checkoutId: string,
  producerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("checkouts")
    .delete()
    .eq("id", checkoutId)
    .eq("producer_id", producerId);

  if (error) {
    throw repositoryError("Não foi possível excluir o checkout.");
  }
}
