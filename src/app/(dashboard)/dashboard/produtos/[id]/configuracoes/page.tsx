import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductSettingsPageData } from "@/modules/products/application/product-use-cases";
import { ProductSettingsTabs } from "@/modules/products/presentation/components/product-settings-tabs";

type ProductSettingsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ProductSettingsPage({
  params,
}: ProductSettingsPageProps) {
  const { id } = await params;

  if (!uuidRegex.test(id)) {
    notFound();
  }

  const data = await getProductSettingsPageData(id);

  if (!data) {
    notFound();
  }

  const { checkoutLink, product } = data;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary">Configurações do produto</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">
            {product.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Gerencie o link de checkout, a entrega do conteúdo e os dados do
            produto.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/produtos">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
      </div>

      <ProductSettingsTabs
        checkoutLink={checkoutLink}
        product={product}
        productId={id}
      />
    </div>
  );
}
