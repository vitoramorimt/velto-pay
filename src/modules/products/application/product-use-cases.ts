import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
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
      producer: Producer | null;
      products: [];
    }
  | {
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
      producer,
      products: [],
      state,
    };
  }

  if (!producer) {
    throw new ProductUseCaseError("Produtor não encontrado.");
  }

  return {
    producer,
    products: await listProductsByProducerId(supabase, producer.id),
    state,
  };
}

export async function getProductForEditUseCase(
  productId: string,
): Promise<ProductFormValues | null> {
  const { producer, supabase } = await requireProductProducer(
    `/dashboard/produtos/${productId}/editar`,
  );
  const product = await findProductByProducerId(
    supabase,
    productId,
    producer.id,
  );

  return product ? toProductFormValues(product) : null;
}

export async function createProductUseCase(
  input: CreateProductInput,
): Promise<Product> {
  const { producer, supabase } = await requireProductProducer(
    "/dashboard/produtos",
  );
  const slug = await resolveUniqueRandomProductSlug(supabase);

  return insertProduct(supabase, {
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
}

export async function updateProductUseCase(
  input: UpdateProductInput,
): Promise<Product> {
  const { producer, supabase } = await requireProductProducer(
    `/dashboard/produtos/${input.id}/editar`,
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

  return updateProductByProducerId(supabase, input.id, producer.id, {
    delivery_url: optionalStringToNull(input.deliveryUrl),
    description: optionalStringToNull(input.description),
    image_url: optionalStringToNull(input.salesPageUrl),
    name: input.name,
    price_cents: getPriceCents(input.price),
    slug,
    status: input.status,
  });
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

  return updateProductByProducerId(supabase, input.id, producer.id, {
    status: input.status,
  });
}
