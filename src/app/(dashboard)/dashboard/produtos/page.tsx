import Link from "next/link";
import { Boxes, Plus, ShieldAlert } from "lucide-react";

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
import { ProductsTable } from "@/modules/products/presentation/components/products-table";

function getAccessMessage(state: string) {
  if (state === "missing_producer") {
    return {
      description:
        "Sua conta está autenticada, mas ainda não possui um perfil de produtor vinculado.",
      title: "Perfil de produtor necessário",
    };
  }

  if (state === "pending_approval") {
    return {
      description:
        "Seu perfil de produtor está aguardando aprovação do admin mínimo definido para o MVP.",
      title: "Produtor aguardando aprovação",
    };
  }

  if (state === "blocked") {
    return {
      description:
        "O perfil de produtor está bloqueado e não pode gerenciar produtos.",
      title: "Produtor bloqueado",
    };
  }

  return {
    description:
      "O perfil de produtor não está aprovado para gerenciar produtos.",
    title: "Acesso indisponível",
  };
}

export default async function ProductsPage() {
  const data = await getProductsPageData();
  const activeProducts = data.products.filter(
    (product) => product.status === "active",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="velto-surface rounded-lg p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="secondary">Sprint 5</Badge>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-3xl">
              Produtos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Cadastre e mantenha produtos digitais de venda única. Checkout,
              pagamentos e afiliados permanecem fora desta sprint.
            </p>
          </div>

          {data.state === "ready" ? (
            <Button asChild>
              <Link href="/dashboard/produtos/novo">
                <Plus />
                Novo produto
              </Link>
            </Button>
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
            <Card>
              <CardHeader>
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-2xl">
                  {data.products.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Ativos</CardDescription>
                <CardTitle className="text-2xl">{activeProducts}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
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
            <ProductsTable products={data.products} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  description="Comece cadastrando um produto digital com nome, preço, descrição e status inicial."
                  icon={Boxes}
                  title="Nenhum produto cadastrado"
                />
                <div className="mt-5 flex justify-center">
                  <Button asChild>
                    <Link href="/dashboard/produtos/novo">
                      <Plus />
                      Criar produto
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
