import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckoutEditorClient } from "@/modules/checkout/presentation/components/checkout-editor-client";
import { getProductSettingsPageData } from "@/modules/products/application/product-use-cases";

type CheckoutEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function CheckoutEditorPage({
  params,
}: CheckoutEditorPageProps) {
  const { id } = await params;

  if (!uuidRegex.test(id)) {
    notFound();
  }

  const data = await getProductSettingsPageData(id);

  if (!data || !data.checkoutLink) {
    notFound();
  }

  const { checkoutLink } = data;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/produtos/${id}/configuracoes`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-sm font-medium">Editar checkout</p>
            <p className="truncate text-xs text-muted-foreground">
              {checkoutLink.checkoutName}
            </p>
          </div>
        </div>
        <Badge
          className="max-w-full border-accent/30 bg-accent/10 text-accent"
          variant="outline"
        >
          Pré-visualização ao vivo
        </Badge>
      </header>

      <CheckoutEditorClient
        checkoutId={checkoutLink.checkoutId}
        initialBadges={checkoutLink.checkoutBadges}
        initialBannerUrl={checkoutLink.checkoutBannerUrl}
        initialDescription={checkoutLink.checkoutDescription}
        initialHeadline={checkoutLink.checkoutHeadline}
        initialLogoUrl={checkoutLink.checkoutLogoUrl}
        initialPrimaryColor={checkoutLink.checkoutPrimaryColor}
        initialSecurePurchaseEnabled={
          checkoutLink.checkoutSecurePurchaseEnabled
        }
        initialTheme={checkoutLink.checkoutTheme}
        product={checkoutLink.product}
        productId={id}
      />
    </div>
  );
}
