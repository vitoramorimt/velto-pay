"use server";

import { revalidatePath } from "next/cache";

import {
  WalletUseCaseError,
  requestWithdrawalUseCase,
  saveWithdrawalSettingsUseCase,
} from "@/modules/wallet/application/wallet-use-cases";
import {
  withdrawalRequestSchema,
  withdrawalSettingsSchema,
  type WithdrawalRequestInput,
  type WithdrawalSettingsInput,
} from "@/modules/wallet/domain/schemas";

export type WalletActionResult = {
  message: string;
  status: "error" | "success";
};

function validationError(): WalletActionResult {
  return {
    message: "Revise os campos destacados e tente novamente.",
    status: "error",
  };
}

function actionError(error: unknown): WalletActionResult {
  if (error instanceof WalletUseCaseError || error instanceof Error) {
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

export async function saveWithdrawalSettingsAction(
  input: WithdrawalSettingsInput,
): Promise<WalletActionResult> {
  const parsedInput = withdrawalSettingsSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  try {
    await saveWithdrawalSettingsUseCase(parsedInput.data);
  } catch (error) {
    return actionError(error);
  }

  revalidatePath("/dashboard/configuracoes/recebimentos");
  revalidatePath("/dashboard/financeiro");

  return {
    message: "Chave Pix padrão salva com sucesso.",
    status: "success",
  };
}

export async function requestWithdrawalAction(
  input: WithdrawalRequestInput,
): Promise<WalletActionResult> {
  const parsedInput = withdrawalRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  try {
    await requestWithdrawalUseCase(parsedInput.data);
  } catch (error) {
    return actionError(error);
  }

  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard/notificacoes");

  return {
    message: "Saque solicitado com sucesso.",
    status: "success",
  };
}
