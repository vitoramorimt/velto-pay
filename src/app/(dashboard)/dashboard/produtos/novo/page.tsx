import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductsPageData } from "@/modules/products/application/product-use-cases";
import type { ProductFormValues } from "@/modules/products/domain/types";
import { ProductForm } from "@/modules/products/presentation/components/product-form";

const defaultProductValues: ProductFormValues = {
  deliveryUrl: "",
  description: "",
  imageUrl: "",
  name: "",
  price: "",
  slug: "",
  status: "draft",
};

export default async function NewProductPage() {
  const data = await getProductsPageData();

  if (data.state !== "ready") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Button asChild className="w-fit" size="sm" variant="outline">
          <Link href="/dashboard/produtos">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <EmptyState
          description="Seu perfil de produtor precisa estar aprovado para criar produtos."
          title="Criação indisponível"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary">Novo produto</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">
            Criar produto
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Defina os dados comerciais básicos do produto digital. A entrega e a
            imagem ficam como URLs enquanto Storage e checkout aguardam fases
            futuras.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/produtos">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
      </div>

      <ProductForm defaultValues={defaultProductValues} mode="create" />
    </div>
  );
}
