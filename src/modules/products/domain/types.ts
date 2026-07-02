import type { Enums, Tables } from "@/shared/database.types";

export type Product = Tables<"products">;
export type Producer = Tables<"producers">;
export type ProductStatus = Enums<"product_status">;
export type EditableProductStatus = Extract<
  ProductStatus,
  "draft" | "active" | "inactive"
>;

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  imageUrl: string;
  deliveryUrl: string;
  status: EditableProductStatus;
};

export const PRODUCT_STATUS_LABELS: Record<EditableProductStatus, string> = {
  active: "Ativo",
  draft: "Rascunho",
  inactive: "Inativo",
};

export const PRODUCT_STATUS_DISPLAY_LABELS: Record<ProductStatus, string> = {
  active: "Ativo",
  archived: "Arquivado",
  draft: "Rascunho",
  inactive: "Inativo",
};

export const PRODUCT_STATUS_DESCRIPTIONS: Record<
  EditableProductStatus,
  string
> = {
  active: "Produto disponível para os próximos fluxos comerciais.",
  draft: "Produto em preparação, ainda sem disponibilidade pública.",
  inactive: "Produto pausado e indisponível para novas vendas.",
};
