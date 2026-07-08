"use server";

import { revalidatePath } from "next/cache";

import {
  CheckoutUseCaseError,
  createCheckoutForProductUseCase,
  createCheckoutOfferUseCase,
  deleteCheckoutOfferUseCase,
  deleteCheckoutUseCase,
  updateCheckoutOfferUseCase,
  updateCheckoutPersonalizationUseCase,
} from "@/modules/checkout/application/checkout-use-cases";
import {
  checkoutOfferInputSchema,
  checkoutPersonalizationSchema,
} from "@/modules/checkout/domain/schemas";
import type { CheckoutOffer } from "@/modules/checkout/domain/types";

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
    description?: string | null;
    headline: string;
    primaryColor?: string | null;
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

export type CheckoutOfferActionResult = CheckoutActionResult & {
  offer?: CheckoutOffer;
};

function revalidateCheckoutOfferPaths(productId: string, checkoutSlug?: string) {
  revalidatePath(`/checkout-editor/${productId}`);
  revalidatePath(`/dashboard/produtos/${productId}/configuracoes`);

  if (checkoutSlug) {
    revalidatePath(`/pay/${checkoutSlug}`);
  }
}

export async function createCheckoutOfferAction(
  checkoutId: string,
  productId: string,
  checkoutSlug: string,
  values: {
    amountCents: number;
    badgeText?: string | null;
    description?: string | null;
    productId: string;
    title: string;
  },
): Promise<CheckoutOfferActionResult> {
  const parsed = checkoutOfferInputSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Dados do order bump inválidos.",
      status: "error",
    };
  }

  try {
    const offer = await createCheckoutOfferUseCase(checkoutId, parsed.data);

    revalidateCheckoutOfferPaths(productId, checkoutSlug);

    return {
      message: "Order bump criado com sucesso.",
      offer,
      status: "success",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateCheckoutOfferAction(
  offerId: string,
  productId: string,
  checkoutSlug: string,
  values: {
    amountCents: number;
    badgeText?: string | null;
    description?: string | null;
    title: string;
  },
): Promise<CheckoutOfferActionResult> {
  const parsed = checkoutOfferInputSchema
    .omit({ productId: true })
    .safeParse(values);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Dados do order bump inválidos.",
      status: "error",
    };
  }

  try {
    const offer = await updateCheckoutOfferUseCase(offerId, parsed.data);

    revalidateCheckoutOfferPaths(productId, checkoutSlug);

    return {
      message: "Order bump atualizado com sucesso.",
      offer,
      status: "success",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteCheckoutOfferAction(
  offerId: string,
  productId: string,
  checkoutSlug: string,
): Promise<CheckoutActionResult> {
  try {
    await deleteCheckoutOfferUseCase(offerId);

    revalidateCheckoutOfferPaths(productId, checkoutSlug);

    return {
      message: "Order bump removido com sucesso.",
      status: "success",
    };
  } catch (error) {
    return actionError(error);
  }
}
