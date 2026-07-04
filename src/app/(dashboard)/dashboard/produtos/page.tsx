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
        "Sua conta está autenticada, mas ainda não possui um perfil de produtor vinculado. Faça login novamente ou aguarde a sincronização do onboarding.",
      title: "Perfil de produtor necessário",
    };
  }

  return {
    description: "Não foi possível liberar o catálogo para esta conta.",
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
              Produtos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Cadastre e mantenha seus produtos digitais. Para o MVP atual, todo
              produtor autenticado pode criar e gerenciar produtos.
            </p>
          </div>

          {data.state === "ready" ? (
            <ProductCreateDialog>
              <Button className="shadow-[0_18px_52px_hsl(var(--accent)/0.14)]">
                <Plus />
                Novo produto
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="velto-card">
              <CardHeader>
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-2xl">
                  {data.products.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="velto-card">
              <CardHeader>
                <CardDescription>Ativos</CardDescription>
                <CardTitle className="text-2xl">{activeProducts}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="velto-card">
              <CardHeader>
                <CardDescription>Produtor</CardDescription>
                <CardTitle className="truncate text-base">
                  {data.producer.brand_name ??
                    data.producer.company_name ??
                    "Velto"}
                </CardTitle>
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
                  title="Nenhum produto cadastrado"
                />
                <div className="mt-5 flex justify-center">
                  <ProductCreateDialog>
                    <Button>
                      <Plus />
                      Criar produto
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
