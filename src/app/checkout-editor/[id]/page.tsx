import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckoutTemplate } from "@/modules/checkout/presentation/components/checkout-template";
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
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/produtos/${id}/configuracoes`}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium">Editar checkout</p>
            <p className="text-xs text-muted-foreground">
              {checkoutLink.checkoutName}
            </p>
          </div>
        </div>
        <Badge className="border-accent/30 bg-accent/10 text-accent" variant="outline">
          Pré-visualização ao vivo
        </Badge>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-w-0 flex-1 overflow-y-auto bg-muted/20">
          <CheckoutTemplate product={checkoutLink.product} variant="preview" />
        </div>

        <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card lg:w-96 lg:border-l lg:border-t-0">
          <Card className="rounded-none border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Personalização</CardTitle>
              <CardDescription>
                Ajuste os detalhes que os compradores veem nesta página.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-6 text-center">
                <Sparkles className="h-5 w-5 text-accent" />
                <p className="text-sm font-medium">Em breve</p>
                <p className="text-sm text-muted-foreground">
                  As opções de edição (título, descrição, cor e outros
                  detalhes) chegam nesta área em uma próxima etapa.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
