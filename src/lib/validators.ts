import { z } from "zod";

export const customerFormSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.string().trim().email("Informe um email válido"),
  document: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11 || value.length === 14, {
      message: "Informe um CPF ou CNPJ válido",
    }),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 10 && value.length <= 11, {
      message: "Informe um celular válido",
    }),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const cardFormSchema = z.object({
  holderName: z
    .string()
    .trim()
    .min(3, "Informe o nome como está no cartão"),
  number: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 13 && value.length <= 19, {
      message: "Número de cartão inválido",
    }),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Use o formato MM/AA")
    .refine((value) => {
      const [month] = value.split("/");
      const monthNumber = Number(month);
      return monthNumber >= 1 && monthNumber <= 12;
    }, "Mês inválido"),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "CVV inválido"),
  installments: z.number().int().min(1).max(12),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;

export const boletoFormSchema = z.object({
  payerDocument: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11 || value.length === 14, {
      message: "Informe um CPF ou CNPJ válido",
    }),
  payerName: z.string().trim().min(3, "Informe o nome completo"),
});

export type BoletoFormValues = z.infer<typeof boletoFormSchema>;
