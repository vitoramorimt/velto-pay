import { z } from "zod";

export const publicCheckoutOrderSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .max(32, "O cupom deve ter no máximo 32 caracteres.")
    .optional()
    .transform((value) => value || undefined),
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
  orderBumpIds: z.array(z.uuid()).default([]),
  utmCampaign: z.string().trim().max(120).optional(),
  utmContent: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmTerm: z.string().trim().max(120).optional(),
});

export type PublicCheckoutOrderInput = z.infer<
  typeof publicCheckoutOrderSchema
>;
