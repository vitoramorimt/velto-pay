import { z } from "zod";

import { parseProductPriceToCents } from "@/modules/products/domain/money";

export const pixKeyTypes = ["cpf", "cnpj", "email", "phone", "random"] as const;

export const pixKeyTypeLabels: Record<(typeof pixKeyTypes)[number], string> = {
  cnpj: "CNPJ",
  cpf: "CPF",
  email: "E-mail",
  phone: "Telefone",
  random: "Chave aleatória",
};

const holderDocumentSchema = z
  .string()
  .trim()
  .min(11, "Informe o CPF ou CNPJ do titular.")
  .max(32, "Documento muito longo.");

export const withdrawalSettingsSchema = z.object({
  defaultBankName: z.string().trim().max(120).optional(),
  defaultHolderDocument: holderDocumentSchema,
  defaultHolderName: z
    .string()
    .trim()
    .min(3, "Informe o nome do titular.")
    .max(160, "Nome muito longo."),
  defaultPixKey: z
    .string()
    .trim()
    .min(3, "Informe a chave Pix.")
    .max(160, "Chave Pix muito longa."),
  defaultPixKeyType: z.enum(pixKeyTypes, {
    error: "Selecione o tipo de chave Pix.",
  }),
});

export const withdrawalRequestSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Informe o valor do saque.")
    .transform((value, context) => {
      const cents = parseProductPriceToCents(value);

      if (cents === null || cents <= 0) {
        context.addIssue({
          code: "custom",
          message: "Informe um valor de saque válido.",
        });

        return z.NEVER;
      }

      return cents;
    }),
  bankName: z.string().trim().max(120).optional(),
  holderDocument: holderDocumentSchema,
  holderName: z
    .string()
    .trim()
    .min(3, "Informe o nome do titular.")
    .max(160, "Nome muito longo."),
  pixKey: z
    .string()
    .trim()
    .min(3, "Informe a chave Pix.")
    .max(160, "Chave Pix muito longa."),
  pixKeyType: z.enum(pixKeyTypes, {
    error: "Selecione o tipo de chave Pix.",
  }),
});

export type WithdrawalRequestInput = z.input<typeof withdrawalRequestSchema>;
export type WithdrawalRequestParsedInput = z.output<
  typeof withdrawalRequestSchema
>;
export type WithdrawalSettingsInput = z.infer<typeof withdrawalSettingsSchema>;
