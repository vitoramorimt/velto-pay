import "server-only";

import type { Database } from "@/shared/database.types";

type ProducerRow = Database["public"]["Tables"]["producers"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type CheckoutRow = Database["public"]["Tables"]["checkouts"]["Row"];
type CheckoutInsert = Database["public"]["Tables"]["checkouts"]["Insert"];
type CheckoutUpdate = Database["public"]["Tables"]["checkouts"]["Update"];
type CheckoutOfferRow = Database["public"]["Tables"]["checkout_offers"]["Row"];
type CheckoutOfferInsert =
  Database["public"]["Tables"]["checkout_offers"]["Insert"];
type CheckoutOfferUpdate =
  Database["public"]["Tables"]["checkout_offers"]["Update"];

export const DEV_BYPASS_PRODUCER_ID = "dev-bypass-producer";

export function isDevBypassEnabled(): boolean {
  return process.env.DEV_BYPASS_AUTH === "true";
}

export const devBypassProducer: ProducerRow = {
  brand_name: "Loja de Testes (Dev)",
  company_name: "Dev Bypass Ltda",
  created_at: new Date().toISOString(),
  document: null,
  id: DEV_BYPASS_PRODUCER_ID,
  status: "approved",
  updated_at: new Date().toISOString(),
  user_id: "dev-bypass-user",
};

// Different Next.js dev route/action bundles can each get their own module
// instance, so module-scoped state would fragment across them. Storing the
// maps on globalThis keeps a single shared store for the whole process.
const globalForDevStore = globalThis as unknown as {
  __veltoDevProducts?: Map<string, ProductRow>;
  __veltoDevCheckouts?: Map<string, CheckoutRow>;
  __veltoDevCheckoutOffers?: Map<string, CheckoutOfferRow>;
};

const products =
  globalForDevStore.__veltoDevProducts ?? new Map<string, ProductRow>();
const checkouts =
  globalForDevStore.__veltoDevCheckouts ?? new Map<string, CheckoutRow>();
const checkoutOffers =
  globalForDevStore.__veltoDevCheckoutOffers ??
  new Map<string, CheckoutOfferRow>();

globalForDevStore.__veltoDevProducts = products;
globalForDevStore.__veltoDevCheckouts = checkouts;
globalForDevStore.__veltoDevCheckoutOffers = checkoutOffers;

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(): string {
  return globalThis.crypto.randomUUID();
}

function sortByCreatedAtDesc<T extends { created_at: string }>(rows: T[]): T[] {
  return rows.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export const mockProductsStore = {
  findById(id: string): ProductRow | null {
    return products.get(id) ?? null;
  },

  insert(product: ProductInsert): ProductRow {
    const id = product.id ?? randomId();
    const timestamp = nowIso();
    const row: ProductRow = {
      created_at: product.created_at ?? timestamp,
      currency: product.currency ?? "BRL",
      delivery_url: product.delivery_url ?? null,
      description: product.description ?? null,
      id,
      image_url: product.image_url ?? null,
      name: product.name,
      price_cents: product.price_cents,
      producer_id: product.producer_id,
      product_type: product.product_type ?? "one_time",
      slug: product.slug,
      status: product.status ?? "draft",
      updated_at: product.updated_at ?? timestamp,
    };

    products.set(id, row);

    return row;
  },

  list(): ProductRow[] {
    return sortByCreatedAtDesc(Array.from(products.values()));
  },

  slugExists(slug: string, idToIgnore?: string): boolean {
    return Array.from(products.values()).some(
      (product) => product.slug === slug && product.id !== idToIgnore,
    );
  },

  update(id: string, patch: ProductUpdate): ProductRow | null {
    const existing = products.get(id);

    if (!existing) {
      return null;
    }

    const updated: ProductRow = {
      ...existing,
      ...patch,
      id: existing.id,
      producer_id: existing.producer_id,
      updated_at: nowIso(),
    };

    products.set(id, updated);

    return updated;
  },
};

export const mockCheckoutsStore = {
  delete(id: string): void {
    checkouts.delete(id);
  },

  findByProductId(productId: string): CheckoutRow | null {
    return (
      Array.from(checkouts.values()).find(
        (checkout) => checkout.product_id === productId,
      ) ?? null
    );
  },

  findBySlug(slug: string): CheckoutRow | null {
    return (
      Array.from(checkouts.values()).find(
        (checkout) => checkout.slug === slug,
      ) ?? null
    );
  },

  list(): CheckoutRow[] {
    return sortByCreatedAtDesc(Array.from(checkouts.values()));
  },

  slugExists(slug: string, idToIgnore?: string): boolean {
    return Array.from(checkouts.values()).some(
      (checkout) => checkout.slug === slug && checkout.id !== idToIgnore,
    );
  },

  upsert(
    payload: CheckoutInsert | CheckoutUpdate,
    existingId?: string,
  ): CheckoutRow {
    const existing = existingId ? checkouts.get(existingId) : undefined;
    const id = existing?.id ?? existingId ?? randomId();
    const timestamp = nowIso();
    const row: CheckoutRow = {
      badges: payload.badges ?? existing?.badges ?? [],
      created_at: existing?.created_at ?? timestamp,
      description: payload.description ?? null,
      headline: payload.headline ?? null,
      id,
      order_bump_enabled:
        payload.order_bump_enabled ?? existing?.order_bump_enabled ?? false,
      primary_color: payload.primary_color ?? existing?.primary_color ?? null,
      producer_id: payload.producer_id ?? existing?.producer_id ?? "",
      product_id: payload.product_id ?? existing?.product_id ?? "",
      published_at: payload.published_at ?? null,
      slug: payload.slug ?? existing?.slug ?? "",
      status: payload.status ?? existing?.status ?? "draft",
      theme: payload.theme ?? existing?.theme ?? "dark",
      updated_at: timestamp,
      upsell_enabled: payload.upsell_enabled ?? existing?.upsell_enabled ?? false,
    };

    checkouts.set(id, row);

    return row;
  },
};

export const mockOffersStore = {
  countByCheckoutIdAndType(
    checkoutId: string,
    offerType: CheckoutOfferRow["offer_type"],
  ): number {
    return Array.from(checkoutOffers.values()).filter(
      (offer) =>
        offer.checkout_id === checkoutId && offer.offer_type === offerType,
    ).length;
  },

  delete(id: string): void {
    checkoutOffers.delete(id);
  },

  findById(id: string): CheckoutOfferRow | null {
    return checkoutOffers.get(id) ?? null;
  },

  insert(payload: CheckoutOfferInsert): CheckoutOfferRow {
    const id = payload.id ?? randomId();
    const timestamp = nowIso();
    const row: CheckoutOfferRow = {
      amount_cents: payload.amount_cents,
      badge_text: payload.badge_text ?? null,
      checkout_id: payload.checkout_id,
      created_at: payload.created_at ?? timestamp,
      currency: payload.currency ?? "BRL",
      description: payload.description ?? null,
      id,
      metadata: payload.metadata ?? {},
      offer_type: payload.offer_type,
      position: payload.position ?? 0,
      producer_id: payload.producer_id,
      product_id: payload.product_id ?? null,
      status: payload.status ?? "active",
      title: payload.title,
      updated_at: payload.updated_at ?? timestamp,
    };

    checkoutOffers.set(id, row);

    return row;
  },

  listByCheckoutId(checkoutId: string): CheckoutOfferRow[] {
    return sortByCreatedAtDesc(
      Array.from(checkoutOffers.values()).filter(
        (offer) => offer.checkout_id === checkoutId,
      ),
    ).sort((a, b) => a.position - b.position);
  },

  update(id: string, patch: CheckoutOfferUpdate): CheckoutOfferRow | null {
    const existing = checkoutOffers.get(id);

    if (!existing) {
      return null;
    }

    const updated: CheckoutOfferRow = {
      ...existing,
      ...patch,
      checkout_id: existing.checkout_id,
      id: existing.id,
      producer_id: existing.producer_id,
      updated_at: nowIso(),
    };

    checkoutOffers.set(id, updated);

    return updated;
  },
};
