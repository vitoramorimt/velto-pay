import { z } from "zod";

import { CHECKOUT_BADGE_ORDER } from "@/modules/checkout/domain/badges";
import {
  isProductPriceInRange,
  parseProductPriceToCents,
} from "@/modules/products/domain/money";

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
    }, message);

const optionalTextSchema = (maxLength: number, message: string) =>
  z.string().trim().max(maxLength, message);

const priceSchema = z
  .string()
  .trim()
  .min(1, "Informe o preço do produto.")
  .refine(
    (value) => parseProductPriceToCents(value) !== null,
    "Informe um preço válido.",
  )
  .refine(
    isProductPriceInRange,
    "O preço precisa estar entre R$ 5,00 e R$ 50.000,00.",
  );

const offerBenefitSchema = z.object({
  id: z.string().trim().min(1).max(60),
  text: optionalTextSchema(120, "O benefício deve ter no máximo 120 caracteres."),
});

const offerFaqSchema = z.object({
  answer: optionalTextSchema(280, "A resposta deve ter no máximo 280 caracteres."),
  id: z.string().trim().min(1).max(60),
  question: optionalTextSchema(
    140,
    "A pergunta deve ter no máximo 140 caracteres.",
  ),
});

const offerTestimonialSchema = z.object({
  id: z.string().trim().min(1).max(60),
  name: optionalTextSchema(80, "O nome deve ter no máximo 80 caracteres."),
  quote: optionalTextSchema(
    260,
    "O depoimento deve ter no máximo 260 caracteres.",
  ),
  role: optionalTextSchema(80, "O contexto deve ter no máximo 80 caracteres."),
});

const offerBonusSchema = z.object({
  description: optionalTextSchema(
    240,
    "A descrição do bônus deve ter no máximo 240 caracteres.",
  ),
  id: z.string().trim().min(1).max(60),
  title: optionalTextSchema(120, "O bônus deve ter no máximo 120 caracteres."),
  value: optionalTextSchema(60, "O valor deve ter no máximo 60 caracteres."),
});

const offerTrustSealSchema = z.object({
  id: z.string().trim().min(1).max(60),
  label: optionalTextSchema(80, "O selo deve ter no máximo 80 caracteres."),
});

const checkoutBadgeInputSchema = z.object({
  enabled: z.boolean(),
  id: z.enum(CHECKOUT_BADGE_ORDER as [string, ...string[]]),
  label: z
    .string()
    .trim()
    .min(1, "Informe o texto do selo.")
    .max(60, "O selo deve ter no máximo 60 caracteres."),
});

export const offerCenterSaveSchema = z.object({
  checkout: z.object({
    badges: z
      .array(checkoutBadgeInputSchema)
      .min(1)
      .max(CHECKOUT_BADGE_ORDER.length),
    bannerUrl: optionalUrlSchema("Informe uma URL de banner válida."),
    description: optionalTextSchema(
      280,
      "A descrição do checkout deve ter no máximo 280 caracteres.",
    ),
    headline: z
      .string()
      .trim()
      .min(2, "Informe o nome exibido.")
      .max(120, "O nome exibido deve ter no máximo 120 caracteres."),
    logoUrl: optionalUrlSchema("Informe uma URL de logo válida."),
    primaryColor: z
      .union([
        z.literal(""),
        z.string().regex(/^#[0-9a-fA-F]{6}$/, "Informe uma cor válida."),
      ])
      .optional()
      .transform((value) => value || ""),
    securePurchaseEnabled: z.boolean(),
    theme: z.enum(["dark", "light"]),
  }),
  conversion: z.object({
    benefits: z.array(offerBenefitSchema).max(12),
    bonuses: z.array(offerBonusSchema).max(12),
    countdownEnabled: z.boolean(),
    countdownEndsAt: z.string().trim().max(80),
    faqs: z.array(offerFaqSchema).max(12),
    guarantee: optionalTextSchema(
      220,
      "A garantia deve ter no máximo 220 caracteres.",
    ),
    testimonials: z.array(offerTestimonialSchema).max(12),
    trustSeals: z.array(offerTrustSealSchema).max(12),
    urgencyText: optionalTextSchema(
      160,
      "A urgência deve ter no máximo 160 caracteres.",
    ),
  }),
  product: z.object({
    category: optionalTextSchema(
      80,
      "A categoria deve ter no máximo 80 caracteres.",
    ),
    description: optionalTextSchema(
      500,
      "A descrição deve ter no máximo 500 caracteres.",
    ),
    imageUrl: optionalUrlSchema("Informe uma URL de imagem válida."),
    name: z
      .string()
      .trim()
      .min(3, "Informe um nome com pelo menos 3 caracteres.")
      .max(140, "Informe um nome menor."),
    price: priceSchema,
    status: z.enum(["draft", "active", "inactive"]),
  }),
});

export type OfferCenterSaveSchemaInput = z.infer<typeof offerCenterSaveSchema>;

export function optionalStringToNull(value: string | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}
