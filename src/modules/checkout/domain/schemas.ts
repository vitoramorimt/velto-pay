import { z } from "zod";

export const publicCheckoutOrderSchema = z.object({
  customerEmail: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail deve ter no máximo 254 caracteres."),
  customerName: z
    .string()
    .trim()
    .min(2, "Informe seu nome.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Checkout inválido."),
});

export type PublicCheckoutOrderInput = z.infer<
  typeof publicCheckoutOrderSchema
>;
