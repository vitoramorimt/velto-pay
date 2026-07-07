import "server-only";

import type { Database } from "@/shared/database.types";

type ProducerRow = Database["public"]["Tables"]["producers"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type CheckoutRow = Database["public"]["Tables"]["checkouts"]["Row"];
type CheckoutInsert = Database["public"]["Tables"]["checkouts"]["Insert"];
type CheckoutUpdate = Database["public"]["Tables"]["checkouts"]["Update"];
type OfferContentRow =
  Database["public"]["Tables"]["product_offer_contents"]["Row"];
type OfferContentInsert =
  Database["public"]["Tables"]["product_offer_contents"]["Insert"];
type OfferContentUpdate =
  Database["public"]["Tables"]["product_offer_contents"]["Update"];

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
  __veltoDevOfferContents?: Map<string, OfferContentRow>;
};

const products =
  globalForDevStore.__veltoDevProducts ?? new Map<string, ProductRow>();
const checkouts =
  globalForDevStore.__veltoDevCheckouts ?? new Map<string, CheckoutRow>();
const offerContents =
  globalForDevStore.__veltoDevOfferContents ??
  new Map<string, OfferContentRow>();

globalForDevStore.__veltoDevProducts = products;
globalForDevStore.__veltoDevCheckouts = checkouts;
globalForDevStore.__veltoDevOfferContents = offerContents;

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
      category: product.category ?? null,
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
      banner_url: payload.banner_url ?? existing?.banner_url ?? null,
      created_at: existing?.created_at ?? timestamp,
      description: payload.description ?? null,
      headline: payload.headline ?? null,
      id,
      logo_url: payload.logo_url ?? existing?.logo_url ?? null,
      order_bump_enabled:
        payload.order_bump_enabled ?? existing?.order_bump_enabled ?? false,
      primary_color: payload.primary_color ?? existing?.primary_color ?? null,
      producer_id: payload.producer_id ?? existing?.producer_id ?? "",
      product_id: payload.product_id ?? existing?.product_id ?? "",
      published_at: payload.published_at ?? null,
      secure_purchase_enabled:
        payload.secure_purchase_enabled ??
        existing?.secure_purchase_enabled ??
        true,
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

export const mockOfferContentsStore = {
  findByProductId(productId: string): OfferContentRow | null {
    return (
      Array.from(offerContents.values()).find(
        (content) => content.product_id === productId,
      ) ?? null
    );
  },

  upsert(
    payload: OfferContentInsert | OfferContentUpdate,
    existingId?: string,
  ): OfferContentRow {
    const existing = existingId ? offerContents.get(existingId) : undefined;
    const id = existing?.id ?? existingId ?? randomId();
    const timestamp = nowIso();
    const row: OfferContentRow = {
      benefits: payload.benefits ?? existing?.benefits ?? [],
      bonuses: payload.bonuses ?? existing?.bonuses ?? [],
      countdown_enabled:
        payload.countdown_enabled ?? existing?.countdown_enabled ?? false,
      countdown_ends_at:
        payload.countdown_ends_at ?? existing?.countdown_ends_at ?? null,
      created_at: existing?.created_at ?? timestamp,
      faqs: payload.faqs ?? existing?.faqs ?? [],
      guarantee: payload.guarantee ?? existing?.guarantee ?? null,
      id,
      producer_id: payload.producer_id ?? existing?.producer_id ?? "",
      product_id: payload.product_id ?? existing?.product_id ?? "",
      testimonials: payload.testimonials ?? existing?.testimonials ?? [],
      trust_seals: payload.trust_seals ?? existing?.trust_seals ?? [],
      updated_at: timestamp,
      urgency_text: payload.urgency_text ?? existing?.urgency_text ?? null,
    };

    offerContents.set(id, row);

    return row;
  },
};
