import "server-only";

import { createCheckoutUrl } from "@/modules/checkout/domain/links";
import type { CheckoutLink } from "@/modules/checkout/domain/types";
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import {
  ensureCheckoutForProduct,
  findCheckoutLinkByProductId,
  listCheckoutsByProducerId,
} from "@/modules/checkout/infrastructure/checkout.repository";
import {
  optionalStringToNull,
  type CreateProductInput,
  type ToggleProductStatusInput,
  type UpdateProductInput,
} from "@/modules/products/domain/schemas";
import {
  formatCentsToDecimalInput,
  parseProductPriceToCents,
} from "@/modules/products/domain/money";
import type {
  Product,
  ProductFormValues,
  Producer,
} from "@/modules/products/domain/types";
import {
  findProducerByUserId,
  findProductByProducerId,
  insertProduct,
  listProductsByProducerId,
  resolveUniqueRandomProductSlug,
  resolveUniqueProductSlug,
  updateProductByProducerId,
} from "@/modules/products/infrastructure/products.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

type ProducerAccessState = "missing_producer" | "ready";

export type ProductsPageData =
  | {
      state: Exclude<ProducerAccessState, "ready">;
      checkoutLinksByProductId: Record<string, string>;
      producer: Producer | null;
      products: [];
    }
  | {
      checkoutLinksByProductId: Record<string, string>;
      state: "ready";
      producer: Producer;
      products: Product[];
    };

export class ProductUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductUseCaseError";
  }
}

function getProducerState(producer: Producer | null): ProducerAccessState {
  if (!producer) {
    return "missing_producer";
  }

  return "ready";
}

export type ProductSettingsPageData = {
  checkoutLink: CheckoutLink | null;
  product: ProductFormValues;
};

async function requireProductProducer(nextPath: string) {
  const user = await requireAuthenticatedUser(nextPath);
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    throw new ProductUseCaseError(
      "Não foi possível encontrar seu perfil de produtor.",
    );
  }

  return {
    producer,
    supabase,
  };
}

function toProductFormValues(product: Product): ProductFormValues {
  return {
    category: product.category ?? "",
    deliveryUrl: product.delivery_url ?? "",
    description: product.description ?? "",
    id: product.id,
    name: product.name,
    price: formatCentsToDecimalInput(product.price_cents),
    salesPageUrl: product.image_url ?? "",
    slug: product.slug,
    status:
      product.status === "active" || product.status === "inactive"
        ? product.status
        : "draft",
  };
}

function getPriceCents(price: string): number {
  const priceCents = parseProductPriceToCents(price);

  if (priceCents === null) {
    throw new ProductUseCaseError("Informe um preço válido.");
  }

  return priceCents;
}

export async function getProductsPageData(): Promise<ProductsPageData> {
  const user = await requireAuthenticatedUser("/dashboard/produtos");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);
  const state = getProducerState(producer);

  if (state !== "ready") {
    return {
      checkoutLinksByProductId: {},
      producer,
      products: [],
      state,
    };
  }

  if (!producer) {
    throw new ProductUseCaseError("Produtor não encontrado.");
  }

  const [products, checkouts] = await Promise.all([
    listProductsByProducerId(supabase, producer.id),
    listCheckoutsByProducerId(supabase, producer.id),
  ]);

  return {
    checkoutLinksByProductId: Object.fromEntries(
      checkouts.map((checkout) => [
        checkout.product.id,
        createCheckoutUrl(checkout.checkoutSlug),
      ]),
    ),
    producer,
    products,
    state,
  };
}

export async function getProductForEditUseCase(
  productId: string,
): Promise<ProductFormValues | null> {
  const { producer, supabase } = await requireProductProducer(
    `/dashboard/produtos/${productId}/configuracoes`,
  );
  const product = await findProductByProducerId(
    supabase,
    productId,
    producer.id,
  );

  return product ? toProductFormValues(product) : null;
}

export async function getProductSettingsPageData(
  productId: string,
): Promise<ProductSettingsPageData | null> {
  const { producer, supabase } = await requireProductProducer(
    `/dashboard/produtos/${productId}/configuracoes`,
  );
  const product = await findProductByProducerId(
    supabase,
    productId,
    producer.id,
  );

  if (!product) {
    return null;
  }

  const checkoutLink = await findCheckoutLinkByProductId(supabase, productId);

  return {
    checkoutLink,
    product: toProductFormValues(product),
  };
}

export async function createProductUseCase(
  input: CreateProductInput,
): Promise<Product> {
  const { producer, supabase } = await requireProductProducer(
    "/dashboard/produtos",
  );
  const slug = await resolveUniqueRandomProductSlug(supabase);

  const product = await insertProduct(supabase, {
    category: optionalStringToNull(input.category),
    currency: "BRL",
    delivery_url: optionalStringToNull(input.deliveryUrl),
    description: optionalStringToNull(input.description),
    image_url: optionalStringToNull(input.salesPageUrl),
    name: input.name,
    price_cents: getPriceCents(input.price),
    producer_id: producer.id,
    product_type: "one_time",
    slug,
    status: input.status,
  });

  await ensureCheckoutForProduct(supabase, product);

  return product;
}

export async function updateProductUseCase(
  input: UpdateProductInput,
): Promise<Product> {
  const { producer, supabase } = await requireProductProducer(
    `/dashboard/produtos/${input.id}/configuracoes`,
  );
  const currentProduct = await findProductByProducerId(
    supabase,
    input.id,
    producer.id,
  );

  if (!currentProduct) {
    throw new ProductUseCaseError("Produto não encontrado.");
  }

  const slug = await resolveUniqueProductSlug(
    supabase,
    input.name,
    input.slug,
    input.id,
  );

  const product = await updateProductByProducerId(supabase, input.id, producer.id, {
    category: optionalStringToNull(input.category),
    delivery_url: optionalStringToNull(input.deliveryUrl),
    description: optionalStringToNull(input.description),
    image_url: optionalStringToNull(input.salesPageUrl),
    name: input.name,
    price_cents: getPriceCents(input.price),
    slug,
    status: input.status,
  });

  await ensureCheckoutForProduct(supabase, product);

  return product;
}

export async function toggleProductStatusUseCase(
  input: ToggleProductStatusInput,
): Promise<Product> {
  const { producer, supabase } = await requireProductProducer(
    "/dashboard/produtos",
  );
  const product = await findProductByProducerId(
    supabase,
    input.id,
    producer.id,
  );

  if (!product) {
    throw new ProductUseCaseError("Produto não encontrado.");
  }

  const updatedProduct = await updateProductByProducerId(supabase, input.id, producer.id, {
    status: input.status,
  });

  await ensureCheckoutForProduct(supabase, updatedProduct);

  return updatedProduct;
}
