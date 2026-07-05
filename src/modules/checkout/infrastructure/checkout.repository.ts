import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CheckoutLink,
  CheckoutCoupon,
  CheckoutOffer,
  CheckoutOfferGroups,
  CheckoutPixel,
  CheckoutProduct,
  CheckoutQuote,
  CheckoutStatus,
  CheckoutSuccessContext,
  CheckoutUtm,
  PublicCheckout,
} from "@/modules/checkout/domain/types";
import { calculateCheckoutTotal } from "@/modules/checkout/domain/pricing";
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
  "description" | "id" | "producer_id" | "slug"
> & {
  product: CheckoutProduct | null;
};

type SuccessContextPayload = CheckoutSuccessContext | null;

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

function toOfferGroups(offers: CheckoutOffer[]): CheckoutOfferGroups {
  return {
    downsells: offers.filter((offer) => offer.offer_type === "downsell"),
    orderBumps: offers.filter((offer) => offer.offer_type === "order_bump"),
    upsells: offers.filter((offer) => offer.offer_type === "upsell"),
  };
}

function normalizeCouponCode(code?: string | null) {
  const normalized = code?.trim();

  return normalized ? normalized.toUpperCase() : null;
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
      "id, producer_id, slug, description, product:products!inner(id, producer_id, name, slug, description, image_url, price_cents, currency, status, created_at, updated_at)",
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

  const [offersResult, pixelsResult] = await Promise.all([
    supabase
      .from("checkout_offers")
      .select(
        "id, offer_type, title, description, amount_cents, currency, badge_text, position",
      )
      .eq("checkout_id", checkout.id)
      .eq("status", "active")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("checkout_pixels")
      .select("id, provider, pixel_id")
      .eq("checkout_id", checkout.id)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
  ]);

  if (offersResult.error || pixelsResult.error) {
    console.error("[checkout] premium checkout data failed", {
      offersError: offersResult.error,
      pixelsError: pixelsResult.error,
    });
    throw repositoryError("Não foi possível carregar o checkout premium.");
  }

  return {
    checkoutId: checkout.id,
    checkoutSlug: checkout.slug,
    description: checkout.description,
    offers: toOfferGroups((offersResult.data ?? []) as CheckoutOffer[]),
    pixels: (pixelsResult.data ?? []) as CheckoutPixel[],
    product: checkout.product,
  };
}

export async function findCheckoutCouponByCode(
  supabase: DatabaseClient,
  checkout: PublicCheckout,
  code?: string | null,
): Promise<CheckoutCoupon | null> {
  const couponCode = normalizeCouponCode(code);

  if (!couponCode) {
    return null;
  }

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, code, discount_type, discount_value, max_redemptions, expires_at",
    )
    .eq("producer_id", checkout.product.producer_id)
    .eq("status", "active")
    .ilike("code", couponCode)
    .order("checkout_id", { ascending: false, nullsFirst: false })
    .limit(10);

  if (error) {
    throw repositoryError("Não foi possível validar o cupom.");
  }

  const coupon = (
    (data ?? []) as (CheckoutCoupon & {
      checkout_id?: string | null;
    })[]
  ).find(
    (item) => !item.checkout_id || item.checkout_id === checkout.checkoutId,
  );

  if (!coupon) {
    throw repositoryError("Cupom inválido ou expirado.");
  }

  if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) {
    throw repositoryError("Cupom inválido ou expirado.");
  }

  if (coupon.max_redemptions) {
    const { count, error: countError } = await supabase
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .in("status", ["reserved", "redeemed"]);

    if (countError) {
      throw repositoryError("Não foi possível validar o limite do cupom.");
    }

    if ((count ?? 0) >= coupon.max_redemptions) {
      throw repositoryError("Cupom sem usos disponíveis.");
    }
  }

  return coupon;
}

export async function getCheckoutQuote(
  supabase: DatabaseClient,
  checkout: PublicCheckout,
  input: {
    couponCode?: string | null;
    orderBumpIds?: string[];
  },
): Promise<CheckoutQuote> {
  const selectedBumpIds = new Set(input.orderBumpIds ?? []);
  const orderBumps = checkout.offers.orderBumps.filter((offer) =>
    selectedBumpIds.has(offer.id),
  );

  if (orderBumps.length !== selectedBumpIds.size) {
    throw repositoryError("Oferta adicional inválida.");
  }

  const coupon = await findCheckoutCouponByCode(
    supabase,
    checkout,
    input.couponCode,
  );
  const totals = calculateCheckoutTotal({
    coupon,
    orderBumps,
    productPriceCents: checkout.product.price_cents,
  });

  return {
    coupon,
    discountCents: totals.discountCents,
    orderBumps,
    productPriceCents: checkout.product.price_cents,
    subtotalCents: totals.subtotalCents,
    totalCents: totals.totalCents,
  };
}

export async function recordCheckoutVisit(
  supabase: DatabaseClient,
  input: {
    checkout: PublicCheckout;
    referrer?: string | null;
    sessionId?: string | null;
    userAgent?: string | null;
    utm: CheckoutUtm;
  },
): Promise<void> {
  const { error } = await supabase.from("checkout_tracking_events").insert({
    checkout_id: input.checkout.checkoutId,
    event_type: "view",
    producer_id: input.checkout.product.producer_id,
    referrer: input.referrer?.slice(0, 500) || null,
    session_id: input.sessionId?.slice(0, 120) || null,
    user_agent: input.userAgent?.slice(0, 500) || null,
    utm_campaign: input.utm.campaign || null,
    utm_content: input.utm.content || null,
    utm_medium: input.utm.medium || null,
    utm_source: input.utm.source || null,
    utm_term: input.utm.term || null,
  });

  if (error) {
    console.error("[checkout] recordCheckoutVisit failed", error);
  }
}

export async function getCheckoutSuccessContextByProviderReference(
  supabase: DatabaseClient,
  providerReference: string,
): Promise<CheckoutSuccessContext | null> {
  const { data, error } = await supabase.rpc("get_checkout_success_context", {
    p_provider_reference: providerReference,
  });

  if (error) {
    throw repositoryError("Não foi possível carregar a página de obrigado.");
  }

  return data as SuccessContextPayload;
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
