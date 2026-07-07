import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { createCheckoutUrl } from "@/modules/checkout/domain/links";
import type { CheckoutLink } from "@/modules/checkout/domain/types";
import {
  ensureCheckoutForProduct,
  findCheckoutLinkByProductId,
  updateCheckoutPersonalization,
} from "@/modules/checkout/infrastructure/checkout.repository";
import {
  parseProductPriceToCents,
  formatCentsToMaskedInput,
} from "@/modules/products/domain/money";
import type { Product } from "@/modules/products/domain/types";
import {
  findProducerByUserId,
  findProductByProducerId,
  updateProductByProducerId,
} from "@/modules/products/infrastructure/products.repository";
import { calculateOfferPaymentSimulation } from "@/modules/offers/domain/payment-simulation";
import { optionalStringToNull } from "@/modules/offers/domain/schemas";
import type {
  OfferCenterSaveInput,
  OfferConversionContent,
  OfferPaymentSimulation,
  OfferProductDraft,
} from "@/modules/offers/domain/types";
import {
  findOfferContentByProductId,
  toOfferConversionContent,
  upsertOfferContent,
} from "@/modules/offers/infrastructure/offer.repository";
import { walletEnv } from "@/shared/config/wallet-env";
import { createSupabaseServerClient } from "@/shared/supabase";

export type OfferCenterPageData = {
  checkout: CheckoutLink;
  conversion: OfferConversionContent;
  paymentSimulation: OfferPaymentSimulation;
  product: OfferProductDraft;
  publicLink: string;
};

export class OfferCenterUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferCenterUseCaseError";
  }
}

function toEditableStatus(product: Product): OfferProductDraft["status"] {
  if (product.status === "active" || product.status === "inactive") {
    return product.status;
  }

  return "draft";
}

function toOfferProductDraft(product: Product): OfferProductDraft {
  return {
    category: product.category ?? "",
    description: product.description ?? "",
    imageUrl: product.image_url ?? "",
    name: product.name,
    price: formatCentsToMaskedInput(product.price_cents),
    status: toEditableStatus(product),
  };
}

async function requireOfferProduct(productId: string, nextPath: string) {
  const user = await requireAuthenticatedUser(nextPath);
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new OfferCenterUseCaseError(
      "Não foi possível encontrar seu perfil de produtor.",
    );
  }

  const product = await findProductByProducerId(
    supabase,
    productId,
    producer.id,
  );

  if (!product) {
    throw new OfferCenterUseCaseError("Produto não encontrado.");
  }

  return {
    producer,
    product,
    supabase,
  };
}

function getPriceCents(price: string): number {
  const priceCents = parseProductPriceToCents(price);

  if (priceCents === null) {
    throw new OfferCenterUseCaseError("Informe um preço válido.");
  }

  return priceCents;
}

export async function getOfferCenterPageData(
  productId: string,
): Promise<OfferCenterPageData> {
  const { product, supabase } = await requireOfferProduct(
    productId,
    `/dashboard/produtos/${productId}/configuracoes`,
  );

  await ensureCheckoutForProduct(supabase, product);

  const [checkout, offerContent] = await Promise.all([
    findCheckoutLinkByProductId(supabase, product.id),
    findOfferContentByProductId(supabase, product.id),
  ]);

  if (!checkout) {
    throw new OfferCenterUseCaseError("Checkout não encontrado.");
  }

  return {
    checkout,
    conversion: toOfferConversionContent(offerContent),
    paymentSimulation: calculateOfferPaymentSimulation({
      fixedFeeCents: walletEnv.platformFeeFixedAmountCents,
      percentage: walletEnv.platformFeePercentage,
      priceCents: product.price_cents,
    }),
    product: toOfferProductDraft(product),
    publicLink: createCheckoutUrl(checkout.checkoutSlug),
  };
}

export async function saveOfferCenterUseCase(
  productId: string,
  input: OfferCenterSaveInput,
): Promise<{ checkoutSlug: string }> {
  const { product, producer, supabase } = await requireOfferProduct(
    productId,
    `/dashboard/produtos/${productId}/configuracoes`,
  );
  const updatedProduct = await updateProductByProducerId(
    supabase,
    product.id,
    producer.id,
    {
      category: optionalStringToNull(input.product.category),
      description: optionalStringToNull(input.product.description),
      image_url: optionalStringToNull(input.product.imageUrl),
      name: input.product.name.trim(),
      price_cents: getPriceCents(input.product.price),
      slug: product.slug,
      status: input.product.status,
    },
  );
  const checkout = await ensureCheckoutForProduct(supabase, updatedProduct);
  const updatedCheckout = await updateCheckoutPersonalization(
    supabase,
    checkout.id,
    producer.id,
    {
      badges: input.checkout.badges,
      bannerUrl: optionalStringToNull(input.checkout.bannerUrl),
      description: optionalStringToNull(input.checkout.description),
      headline: input.checkout.headline.trim(),
      logoUrl: optionalStringToNull(input.checkout.logoUrl),
      primaryColor: optionalStringToNull(input.checkout.primaryColor),
      securePurchaseEnabled: input.checkout.securePurchaseEnabled,
      theme: input.checkout.theme,
    },
  );

  if (!updatedCheckout) {
    throw new OfferCenterUseCaseError("Checkout não encontrado.");
  }

  await upsertOfferContent(
    supabase,
    producer.id,
    updatedProduct.id,
    input.conversion,
  );

  return {
    checkoutSlug: updatedCheckout.slug,
  };
}
