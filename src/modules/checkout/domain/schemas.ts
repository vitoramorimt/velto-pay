import { z } from "zod";

import { CHECKOUT_BADGE_ORDER } from "@/modules/checkout/domain/badges";

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

const checkoutBadgeInputSchema = z.object({
  enabled: z.boolean(),
  id: z.enum(CHECKOUT_BADGE_ORDER as [string, ...string[]]),
  label: z
    .string()
    .trim()
    .min(1, "Informe o texto do selo.")
    .max(60, "O selo deve ter no máximo 60 caracteres."),
});

const optionalUrlSchema = (message: string) =>
  z
    .string()
    .trim()
    .max(500, "Informe uma URL menor.")
    .refine((value) => {
      if (!value) {
        return true;
      }

      return z.url().safeParse(value).success;
    }, message)
    .optional()
    .transform((value) => value || null);

export const checkoutPersonalizationSchema = z.object({
  badges: z.array(checkoutBadgeInputSchema).min(1).max(CHECKOUT_BADGE_ORDER.length),
  bannerUrl: optionalUrlSchema("Informe uma URL de banner válida."),
  description: z
    .string()
    .trim()
    .max(280, "A descrição deve ter no máximo 280 caracteres.")
    .optional()
    .transform((value) => value || null),
  headline: z
    .string()
    .trim()
    .min(2, "Informe um título.")
    .max(120, "O título deve ter no máximo 120 caracteres."),
  logoUrl: optionalUrlSchema("Informe uma URL de logo válida."),
  primaryColor: z
    .union([
      z.literal(""),
      z.string().regex(/^#[0-9a-fA-F]{6}$/, "Informe uma cor válida."),
    ])
    .optional()
    .nullable()
    .transform((value) => value || null),
  securePurchaseEnabled: z.boolean().default(true),
  theme: z.enum(["dark", "light"]),
});

export type CheckoutPersonalizationInput = z.infer<
  typeof checkoutPersonalizationSchema
>;
