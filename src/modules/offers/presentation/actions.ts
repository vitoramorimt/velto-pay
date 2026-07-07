"use server";

import { revalidatePath } from "next/cache";

import {
  OfferCenterUseCaseError,
  saveOfferCenterUseCase,
} from "@/modules/offers/application/offer-center-use-cases";
import { offerCenterSaveSchema } from "@/modules/offers/domain/schemas";
import type { OfferCenterSaveInput } from "@/modules/offers/domain/types";

export type OfferCenterActionResult = {
  message: string;
  status: "error" | "success";
};

function actionError(error: unknown): OfferCenterActionResult {
  if (error instanceof OfferCenterUseCaseError) {
    return {
      message: error.message,
      status: "error",
    };
  }

  return {
    message: "Não foi possível salvar a oferta agora.",
    status: "error",
  };
}

export async function saveOfferCenterAction(
  productId: string,
  input: OfferCenterSaveInput,
): Promise<OfferCenterActionResult> {
  const parsed = offerCenterSaveSchema.safeParse(input);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Revise os campos da oferta.",
      status: "error",
    };
  }

  try {
    const { checkoutSlug } = await saveOfferCenterUseCase(
      productId,
      parsed.data as OfferCenterSaveInput,
    );

    revalidatePath(`/dashboard/produtos/${productId}/configuracoes`);
    revalidatePath("/dashboard/produtos");
    revalidatePath("/dashboard/checkout");
    revalidatePath(`/checkout-editor/${productId}`);
    revalidatePath(`/pay/${checkoutSlug}`);

    return {
      message: "Oferta salva.",
      status: "success",
    };
  } catch (error) {
    return actionError(error);
  }
}
