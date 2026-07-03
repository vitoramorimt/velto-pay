"use server";

import { revalidatePath } from "next/cache";

import {
  CheckoutUseCaseError,
  createCheckoutForProductUseCase,
  deleteCheckoutUseCase,
} from "@/modules/checkout/application/checkout-use-cases";

export type CheckoutActionResult = {
  message: string;
  status: "error" | "success";
};

function actionError(error: unknown): CheckoutActionResult {
  if (error instanceof CheckoutUseCaseError) {
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

export async function createCheckoutForProductAction(
  productId: string,
): Promise<CheckoutActionResult> {
  try {
    const checkout = await createCheckoutForProductUseCase(productId);

    revalidatePath("/dashboard/checkout");
    revalidatePath("/dashboard/produtos");
    revalidatePath(`/pay/${checkout.checkoutSlug}`);

    return {
      message: "Checkout criado com sucesso.",
      status: "success",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteCheckoutAction(
  checkoutId: string,
): Promise<CheckoutActionResult> {
  try {
    await deleteCheckoutUseCase(checkoutId);

    revalidatePath("/dashboard/checkout");
    revalidatePath("/dashboard/produtos");

    return {
      message: "Checkout excluído com sucesso.",
      status: "success",
    };
  } catch (error) {
    return actionError(error);
  }
}
