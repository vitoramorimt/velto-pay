"use server";

import { revalidatePath } from "next/cache";

import {
  CheckoutUseCaseError,
  createCheckoutForProductUseCase,
  deleteCheckoutUseCase,
  updateCheckoutPersonalizationUseCase,
} from "@/modules/checkout/application/checkout-use-cases";
import { checkoutPersonalizationSchema } from "@/modules/checkout/domain/schemas";

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

export async function updateCheckoutPersonalizationAction(
  checkoutId: string,
  productId: string,
  values: {
    badges: { enabled: boolean; id: string; label: string }[];
    bannerUrl?: string | null;
    description?: string | null;
    headline: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    securePurchaseEnabled?: boolean;
    theme: "dark" | "light";
  },
): Promise<CheckoutActionResult> {
  const parsed = checkoutPersonalizationSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message:
        parsed.error.issues[0]?.message ?? "Dados de personalização inválidos.",
      status: "error",
    };
  }

  try {
    const { checkoutSlug } = await updateCheckoutPersonalizationUseCase(
      checkoutId,
      parsed.data,
    );

    revalidatePath(`/checkout-editor/${productId}`);
    revalidatePath(`/dashboard/produtos/${productId}/configuracoes`);
    revalidatePath(`/pay/${checkoutSlug}`);

    return {
      message: "Personalização salva com sucesso.",
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
