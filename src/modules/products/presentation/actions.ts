"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createProductUseCase,
  ProductUseCaseError,
  toggleProductStatusUseCase,
  updateProductUseCase,
} from "@/modules/products/application/product-use-cases";
import {
  createProductSchema,
  toggleProductStatusSchema,
  type CreateProductInput,
  type ToggleProductStatusInput,
  type UpdateProductInput,
  updateProductSchema,
} from "@/modules/products/domain/schemas";

export type ProductActionResult = {
  status: "success" | "error";
  message: string;
};

function validationError(): ProductActionResult {
  return {
    message: "Revise os campos destacados e tente novamente.",
    status: "error",
  };
}

function actionError(error: unknown): ProductActionResult {
  if (error instanceof ProductUseCaseError) {
    return {
      message: error.message,
      status: "error",
    };
  }

  return {
    message: "Não foi possível concluir a operação agora.",
    status: "error",
  };
}

export async function createProductAction(
  input: CreateProductInput,
): Promise<ProductActionResult> {
  const parsedInput = createProductSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  try {
    const product = await createProductUseCase(parsedInput.data);

    revalidatePath(`/pay/${product.slug}`);
  } catch (error) {
    return actionError(error);
  }

  revalidatePath("/dashboard/produtos");
  revalidatePath("/dashboard/checkout");
  revalidatePath("/dashboard");

  return {
    message: "Produto criado com sucesso.",
    status: "success",
  };
}

export async function updateProductAction(
  input: UpdateProductInput,
): Promise<ProductActionResult> {
  const parsedInput = updateProductSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  try {
    const product = await updateProductUseCase(parsedInput.data);

    revalidatePath(`/pay/${product.slug}`);
  } catch (error) {
    return actionError(error);
  }

  revalidatePath("/dashboard/produtos");
  revalidatePath("/dashboard/checkout");
  revalidatePath("/dashboard");
  redirect("/dashboard/produtos");
}

export async function toggleProductStatusAction(
  input: ToggleProductStatusInput,
): Promise<ProductActionResult> {
  const parsedInput = toggleProductStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  try {
    const product = await toggleProductStatusUseCase(parsedInput.data);

    revalidatePath(`/pay/${product.slug}`);
  } catch (error) {
    return actionError(error);
  }

  revalidatePath("/dashboard/produtos");
  revalidatePath("/dashboard/checkout");
  revalidatePath("/dashboard");

  return {
    message: "Status do produto atualizado.",
    status: "success",
  };
}
