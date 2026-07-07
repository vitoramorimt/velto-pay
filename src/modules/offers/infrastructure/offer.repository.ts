import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  normalizeOfferConversionContent,
} from "@/modules/offers/domain/content";
import type { OfferConversionContent } from "@/modules/offers/domain/types";
import type { Database, Json } from "@/shared/database.types";
import {
  isDevBypassEnabled,
  mockOfferContentsStore,
} from "@/shared/dev/mock-data-store";

type DatabaseClient = SupabaseClient<Database>;
type OfferContentRow =
  Database["public"]["Tables"]["product_offer_contents"]["Row"];
type OfferContentInsert =
  Database["public"]["Tables"]["product_offer_contents"]["Insert"];
type OfferContentUpdate =
  Database["public"]["Tables"]["product_offer_contents"]["Update"];

function repositoryError(message: string): Error {
  return new Error(message);
}

function toCountdownEndsAt(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toOfferContentPayload(
  producerId: string,
  productId: string,
  input: OfferConversionContent,
): OfferContentInsert {
  return {
    benefits: input.benefits as unknown as Json,
    bonuses: input.bonuses as unknown as Json,
    countdown_enabled: input.countdownEnabled,
    countdown_ends_at: input.countdownEnabled
      ? toCountdownEndsAt(input.countdownEndsAt)
      : null,
    faqs: input.faqs as unknown as Json,
    guarantee: input.guarantee.trim() || null,
    producer_id: producerId,
    product_id: productId,
    testimonials: input.testimonials as unknown as Json,
    trust_seals: input.trustSeals as unknown as Json,
    urgency_text: input.urgencyText.trim() || null,
  };
}

export function toOfferConversionContent(
  row: OfferContentRow | null,
): OfferConversionContent {
  return normalizeOfferConversionContent(row);
}

export async function findOfferContentByProductId(
  supabase: DatabaseClient,
  productId: string,
): Promise<OfferContentRow | null> {
  if (isDevBypassEnabled()) {
    return mockOfferContentsStore.findByProductId(productId);
  }

  const { data, error } = await supabase
    .from("product_offer_contents")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    throw repositoryError("Não foi possível carregar a oferta.");
  }

  return data;
}

export async function upsertOfferContent(
  supabase: DatabaseClient,
  producerId: string,
  productId: string,
  input: OfferConversionContent,
): Promise<OfferContentRow> {
  const existing = await findOfferContentByProductId(supabase, productId);
  const payload = toOfferContentPayload(producerId, productId, input);

  if (isDevBypassEnabled()) {
    return mockOfferContentsStore.upsert(payload, existing?.id);
  }

  if (existing) {
    const updatePayload: OfferContentUpdate = payload;
    const { data, error } = await supabase
      .from("product_offer_contents")
      .update(updatePayload)
      .eq("id", existing.id)
      .eq("producer_id", producerId)
      .select("*")
      .single();

    if (error) {
      throw repositoryError("Não foi possível salvar a oferta.");
    }

    return data;
  }

  const { data, error } = await supabase
    .from("product_offer_contents")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw repositoryError("Não foi possível criar a oferta.");
  }

  return data;
}
