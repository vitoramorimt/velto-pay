import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { normalizeCheckoutBadges } from "@/modules/checkout/domain/badges";
import type { CheckoutPersonalizationInput } from "@/modules/checkout/domain/schemas";
import { createCheckoutUrl } from "@/modules/checkout/domain/links";
import type {
  CheckoutLink,
  CheckoutSuccessContext,
  CheckoutUtm,
  PublicCheckout,
} from "@/modules/checkout/domain/types";
import {
  deleteCheckoutByProducerId,
  ensureCheckoutForProduct,
  findPublicCheckoutBySlug,
  getCheckoutSuccessContextByProviderReference,
  listCheckoutsByProducerId,
  recordCheckoutVisit,
  updateCheckoutPersonalization,
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

export async function recordPublicCheckoutVisit(
  checkout: PublicCheckout,
  input: {
    referrer?: string | null;
    sessionId?: string | null;
    userAgent?: string | null;
    utm: CheckoutUtm;
  },
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  await recordCheckoutVisit(supabase, {
    checkout,
    ...input,
  });
}

export async function getCheckoutSuccessContext(
  providerReference?: string | null,
): Promise<CheckoutSuccessContext | null> {
  if (!providerReference) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  return getCheckoutSuccessContextByProviderReference(
    supabase,
    providerReference,
  );
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

  const product = await findProductByProducerId(
    supabase,
    productId,
    producer.id,
  );

  if (!product) {
    throw new CheckoutUseCaseError("Produto não encontrado.");
  }

  const checkout = await ensureCheckoutForProduct(supabase, product);

  return {
    checkoutBadges: normalizeCheckoutBadges(checkout.badges),
    checkoutBannerUrl: checkout.banner_url,
    checkoutCreatedAt: checkout.created_at,
    checkoutDescription: checkout.description,
    checkoutHeadline: checkout.headline,
    checkoutId: checkout.id,
    checkoutLogoUrl: checkout.logo_url,
    checkoutName: checkout.headline ?? product.name,
    checkoutPrimaryColor: checkout.primary_color,
    checkoutSecurePurchaseEnabled: checkout.secure_purchase_enabled,
    checkoutSlug: checkout.slug,
    checkoutStatus: checkout.status,
    checkoutTheme: checkout.theme === "light" ? "light" : "dark",
    checkoutUpdatedAt: checkout.updated_at,
    link: createCheckoutUrl(checkout.slug),
    product,
  };
}

export async function updateCheckoutPersonalizationUseCase(
  checkoutId: string,
  input: CheckoutPersonalizationInput,
): Promise<{ checkoutSlug: string }> {
  const user = await requireAuthenticatedUser("/dashboard/checkout");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new CheckoutUseCaseError(
      "Não foi possível encontrar seu perfil de produtor.",
    );
  }

  const updated = await updateCheckoutPersonalization(
    supabase,
    checkoutId,
    producer.id,
    input,
  );

  if (!updated) {
    throw new CheckoutUseCaseError("Checkout não encontrado.");
  }

  return { checkoutSlug: updated.slug };
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
