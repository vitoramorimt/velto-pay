import { Layers3, Plus, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductsPageData } from "@/modules/products/application/product-use-cases";
import { ProductCreateDialog } from "@/modules/products/presentation/components/product-create-dialog";
import { ProductsTable } from "@/modules/products/presentation/components/products-table";

function getAccessMessage(state: string) {
  if (state === "missing_producer") {
    return {
      description:
        "Não conseguimos localizar sua área comercial agora. Saia da conta e entre novamente para atualizar o acesso.",
      title: "Área comercial indisponível",
    };
  }

  return {
    description: "Não foi possível liberar o catálogo para esta conta agora.",
    title: "Acesso indisponível",
  };
}

export default async function ProductsPage() {
  const data = await getProductsPageData();
  const activeProducts = data.products.filter(
    (product) => product.status === "active",
  ).length;

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge
              className="border-accent/25 bg-accent/10 text-accent"
              variant="outline"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Catálogo
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Ofertas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Crie produtos digitais, configure checkout, argumentos de
              conversão e links públicos em uma experiência única.
            </p>
          </div>

          {data.state === "ready" ? (
            <ProductCreateDialog>
              <Button className="h-10 shadow-[0_18px_52px_hsl(var(--accent)/0.14)] sm:h-11">
                <Plus />
                Nova oferta
              </Button>
            </ProductCreateDialog>
          ) : null}
        </div>
      </section>

      {data.state !== "ready" ? (
        <EmptyState
          description={getAccessMessage(data.state).description}
          icon={ShieldAlert}
          title={getAccessMessage(data.state).title}
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="velto-card">
              <CardHeader className="p-4 sm:p-5">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-2xl">
                  {data.products.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="velto-card">
              <CardHeader className="p-4 sm:p-5">
                <CardDescription>Ativos</CardDescription>
                <CardTitle className="text-2xl">{activeProducts}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {data.products.length > 0 ? (
            <ProductsTable
              checkoutLinksByProductId={data.checkoutLinksByProductId}
              products={data.products}
            />
          ) : (
            <Card className="velto-card">
              <CardContent className="pt-6">
                <EmptyState
                  description="Comece cadastrando um produto digital com nome, preço, descrição e status inicial."
                  icon={Layers3}
                  title="Nenhuma oferta cadastrada"
                />
                <div className="mt-5 flex justify-center">
                  <ProductCreateDialog>
                    <Button>
                      <Plus />
                      Criar oferta
                    </Button>
                  </ProductCreateDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
