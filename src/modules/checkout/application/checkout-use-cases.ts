import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { normalizeCheckoutBadges } from "@/modules/checkout/domain/badges";
import type {
  CheckoutOfferInput,
  CheckoutPersonalizationInput,
} from "@/modules/checkout/domain/schemas";
import { createCheckoutUrl } from "@/modules/checkout/domain/links";
import type {
  CheckoutLink,
  CheckoutOffer,
  CheckoutSuccessContext,
  CheckoutUtm,
  PublicCheckout,
} from "@/modules/checkout/domain/types";
import {
  createCheckoutOffer,
  deleteCheckoutByProducerId,
  deleteCheckoutOffer,
  ensureCheckoutForProduct,
  findPublicCheckoutBySlug,
  getCheckoutSuccessContextByProviderReference,
  listCheckoutOffersByCheckoutId,
  listCheckoutsByProducerId,
  recordCheckoutVisit,
  updateCheckoutOffer,
  updateCheckoutPersonalization,
} from "@/modules/checkout/infrastructure/checkout.repository";
import type { Product } from "@/modules/products/domain/types";
import {
  findProducerByUserId,
  findProductByProducerId,
  listProductsByProducerId,
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

export type CheckoutOfferEditorData = {
  offers: CheckoutOffer[];
  producerProducts: Product[];
};

async function requireCheckoutProducer(redirectPath: string) {
  const user = await requireAuthenticatedUser(redirectPath);
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new CheckoutUseCaseError(
      "Não foi possível encontrar seu perfil de produtor.",
    );
  }

  return { producer, supabase };
}

export async function getCheckoutOfferEditorDataUseCase(
  checkoutId: string,
  ownProductId: string,
): Promise<CheckoutOfferEditorData> {
  const { producer, supabase } = await requireCheckoutProducer(
    "/dashboard/checkout",
  );

  const [offers, products] = await Promise.all([
    listCheckoutOffersByCheckoutId(supabase, checkoutId, producer.id),
    listProductsByProducerId(supabase, producer.id),
  ]);

  const producerProducts = products.filter(
    (product) => product.id !== ownProductId,
  );

  return { offers, producerProducts };
}

export async function createCheckoutOfferUseCase(
  checkoutId: string,
  input: CheckoutOfferInput,
): Promise<CheckoutOffer> {
  const { producer, supabase } = await requireCheckoutProducer(
    "/dashboard/checkout",
  );

  const product = await findProductByProducerId(
    supabase,
    input.productId,
    producer.id,
  );

  if (!product) {
    throw new CheckoutUseCaseError("Produto não encontrado.");
  }

  return createCheckoutOffer(supabase, {
    amountCents: input.amountCents,
    badgeText: input.badgeText,
    checkoutId,
    description: input.description,
    producerId: producer.id,
    productId: product.id,
    title: input.title,
  });
}

export async function updateCheckoutOfferUseCase(
  offerId: string,
  input: Omit<CheckoutOfferInput, "productId">,
): Promise<CheckoutOffer> {
  const { producer, supabase } = await requireCheckoutProducer(
    "/dashboard/checkout",
  );

  const updated = await updateCheckoutOffer(supabase, offerId, producer.id, {
    amountCents: input.amountCents,
    badgeText: input.badgeText,
    description: input.description,
    title: input.title,
  });

  if (!updated) {
    throw new CheckoutUseCaseError("Order bump não encontrado.");
  }

  return updated;
}

export async function deleteCheckoutOfferUseCase(
  offerId: string,
): Promise<void> {
  const { producer, supabase } = await requireCheckoutProducer(
    "/dashboard/checkout",
  );

  await deleteCheckoutOffer(supabase, offerId, producer.id);
}
