import { z } from "zod";

import {
  isProductPriceInRange,
  parseProductPriceToCents,
} from "@/modules/products/domain/money";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

export const editableProductStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
]);

const priceSchema = z
  .string()
  .trim()
  .min(1, "Informe o preco do produto.")
  .refine(
    (value) => parseProductPriceToCents(value) !== null,
    "Informe um preco valido.",
  )
  .refine(
    isProductPriceInRange,
    "O preco precisa estar entre R$ 5,00 e R$ 50.000,00.",
  );

const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe um nome com pelo menos 3 caracteres.")
    .max(140, "Informe um nome menor."),
  slug: z
    .string()
    .trim()
    .max(160, "Informe um slug menor.")
    .refine((value) => !value || slugRegex.test(value), {
      message: "Use apenas letras minusculas, numeros e hifens.",
    }),
  description: z
    .string()
    .trim()
    .max(2000, "A descricao deve ter no maximo 2000 caracteres."),
  price: priceSchema,
  imageUrl: optionalUrlSchema("Informe uma URL de imagem valida."),
  deliveryUrl: optionalUrlSchema("Informe uma URL de entrega valida."),
  status: editableProductStatusSchema,
});

export const createProductSchema = productBaseSchema;

export const productFormSchema = productBaseSchema.extend({
  id: z.uuid("Produto invalido.").optional(),
});

export const updateProductSchema = productBaseSchema.extend({
  id: z.uuid("Produto invalido."),
});

export const toggleProductStatusSchema = z.object({
  id: z.uuid("Produto invalido."),
  status: z.enum(["active", "inactive"]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ToggleProductStatusInput = z.infer<
  typeof toggleProductStatusSchema
>;

export function optionalStringToNull(value: string | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}
