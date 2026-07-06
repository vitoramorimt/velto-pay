export type WithdrawalValidationInput = {
  amountCents: number;
  availableBalanceCents: number;
};

export type WithdrawalDefaultSettings = {
  default_bank_name: string | null;
  default_holder_document: string | null;
  default_holder_name: string | null;
  default_pix_key: string | null;
  default_pix_key_type: "cpf" | "cnpj" | "email" | "phone" | "random" | null;
};

export type WithdrawalRequestDefaults = {
  amount: string;
  bankName: string;
  holderDocument: string;
  holderName: string;
  pixKey: string;
  pixKeyType: "cpf" | "cnpj" | "email" | "phone" | "random";
};

export type WithdrawalValidationResult =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export function validateWithdrawalAmount({
  amountCents,
  availableBalanceCents,
}: WithdrawalValidationInput): WithdrawalValidationResult {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return {
      message: "Informe um valor de saque válido.",
      ok: false,
    };
  }

  if (amountCents > availableBalanceCents) {
    return {
      message: "O valor solicitado é maior que o saldo disponível.",
      ok: false,
    };
  }

  return { ok: true };
}

export function reserveWithdrawalBalance(
  availableBalanceCents: number,
  amountCents: number,
): number {
  const validation = validateWithdrawalAmount({
    amountCents,
    availableBalanceCents,
  });

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  return availableBalanceCents - amountCents;
}

export function createWithdrawalRequestDefaults(
  settings: WithdrawalDefaultSettings | null,
): WithdrawalRequestDefaults {
  return {
    amount: "",
    bankName: settings?.default_bank_name ?? "",
    holderDocument: settings?.default_holder_document ?? "",
    holderName: settings?.default_holder_name ?? "",
    pixKey: settings?.default_pix_key ?? "",
    pixKeyType: settings?.default_pix_key_type ?? "cpf",
  };
}
