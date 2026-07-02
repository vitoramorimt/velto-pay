import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductForEditUseCase } from "@/modules/products/application/product-use-cases";
import { ProductForm } from "@/modules/products/presentation/components/product-form";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  if (!uuidRegex.test(id)) {
    notFound();
  }

  const product = await getProductForEditUseCase(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary">Editar produto</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">
            {product.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Atualize os dados do produto. Alterações de checkout, pagamentos e
            afiliação não fazem parte desta sprint.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/produtos">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
      </div>

      <ProductForm defaultValues={product} mode="edit" />
    </div>
  );
}
