import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { createCheckoutUrl } from "@/modules/checkout/domain/links";
import type {
  CheckoutLink,
  PublicCheckout,
} from "@/modules/checkout/domain/types";
import {
  deleteCheckoutByProducerId,
  ensureCheckoutForProduct,
  findPublicCheckoutBySlug,
  listCheckoutsByProducerId,
} from "@/modules/checkout/infrastructure/checkout.repository";
import {
  findProducerByUserId,
  findProductByProducerId,
} from "@/modules/products/infrastructure/products.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

export type CheckoutLinksPageData =
  | {
      state: "missing_producer";
      links: [];
    }
  | {
      state: "ready";
      links: CheckoutLink[];
    };

export class CheckoutUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutUseCaseError";
  }
}

export async function getCheckoutLinksPageData(): Promise<CheckoutLinksPageData> {
  const user = await requireAuthenticatedUser("/dashboard/checkout");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    return {
      links: [],
      state: "missing_producer",
    };
  }

  const checkouts = await listCheckoutsByProducerId(supabase, producer.id);

  return {
    links: checkouts.map((checkout) => ({
      ...checkout,
      link: createCheckoutUrl(checkout.checkoutSlug),
    })),
    state: "ready",
  };
}

export async function getPublicCheckoutBySlug(
  slug: string,
): Promise<PublicCheckout | null> {
  const supabase = await createSupabaseServerClient();

  return findPublicCheckoutBySlug(supabase, slug);
}

export async function createCheckoutForProductUseCase(
  productId: string,
): Promise<CheckoutLink> {
  const user = await requireAuthenticatedUser("/dashboard/checkout");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new CheckoutUseCaseError(
      "Não foi possível encontrar seu perfil de produtor.",
    );
  }

  const product = await findProductByProducerId(supabase, productId, producer.id);

  if (!product) {
    throw new CheckoutUseCaseError("Produto não encontrado.");
  }

  const checkout = await ensureCheckoutForProduct(supabase, product);

  return {
    checkoutCreatedAt: checkout.created_at,
    checkoutId: checkout.id,
    checkoutName: checkout.headline ?? product.name,
    checkoutSlug: checkout.slug,
    checkoutStatus: checkout.status,
    checkoutUpdatedAt: checkout.updated_at,
    link: createCheckoutUrl(checkout.slug),
    product,
  };
}

export async function deleteCheckoutUseCase(checkoutId: string): Promise<void> {
  const user = await requireAuthenticatedUser("/dashboard/checkout");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new CheckoutUseCaseError(
      "Não foi possível encontrar seu perfil de produtor.",
    );
  }

  await deleteCheckoutByProducerId(supabase, checkoutId, producer.id);
}
