import { ExternalLink, Link2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCheckoutLinksPageData } from "@/modules/checkout/application/checkout-use-cases";
import { CheckoutLinkActions } from "@/modules/checkout/presentation/components/checkout-link-actions";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

function getCheckoutStatusLabel(status: "disabled" | "draft" | "published") {
  const labels = {
    disabled: "Desabilitado",
    draft: "Rascunho",
    published: "Publicado",
  };

  return labels[status];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CheckoutPage() {
  const data = await getCheckoutLinksPageData();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="velto-surface rounded-lg p-6 sm:p-8">
        <Badge variant="secondary">Checkout</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              Links de checkout
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie os links públicos de checkout salvos no Supabase e
              vinculados aos produtos do produtor autenticado.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
            Base local: <span className="font-medium">/pay/slug</span>
          </div>
        </div>
      </section>

      {data.state !== "ready" ? (
        <EmptyState
          description="Não foi possível encontrar um perfil de produtor vinculado à sua conta."
          icon={ShieldAlert}
          title="Checkout indisponível"
        />
      ) : data.links.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              description="Crie um produto para gerar automaticamente um link público de checkout."
              icon={Link2}
              title="Nenhum checkout gerado"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="min-w-0">
          <CardHeader className="min-w-0">
            <CardTitle>Checkouts gerados</CardTitle>
            <CardDescription>
              Checkouts persistidos e prontos para compartilhamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.links.map((checkout) => (
                    <TableRow key={checkout.checkoutId}>
                      <TableCell>
                        <div className="max-w-sm">
                          <p className="font-medium">
                            {checkout.checkoutName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getCheckoutStatusLabel(checkout.checkoutStatus)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{checkout.product.name}</TableCell>
                      <TableCell>
                        {formatCentsToCurrency(checkout.product.price_cents)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCheckoutStatusLabel(checkout.checkoutStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {checkout.checkoutSlug}
                      </TableCell>
                      <TableCell>
                        {formatDate(checkout.checkoutCreatedAt)}
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-72 truncate text-sm text-muted-foreground">
                          {checkout.link}
                        </span>
                      </TableCell>
                      <TableCell>
                        <CheckoutLinkActions
                          checkoutId={checkout.checkoutId}
                          href={checkout.link}
                          previewHref={`/pay/${checkout.checkoutSlug}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid min-w-0 gap-3 md:hidden">
              {data.links.map((checkout) => (
                <Card className="min-w-0" key={checkout.checkoutId}>
                  <CardHeader className="min-w-0 gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate">
                          {checkout.checkoutName}
                        </CardTitle>
                        <CardDescription className="mt-1 block max-w-full truncate">
                          {checkout.link}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {getCheckoutStatusLabel(checkout.checkoutStatus)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="min-w-0 space-y-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="block min-w-0 max-w-44 truncate font-medium">
                        {checkout.product.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Preço</span>
                      <span className="font-medium">
                        {formatCentsToCurrency(checkout.product.price_cents)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      {getCheckoutStatusLabel(checkout.checkoutStatus)}
                    </div>
                    <div className="grid min-w-0 gap-1 text-sm">
                      <span className="text-muted-foreground">Slug</span>
                      <span className="block max-w-full truncate font-mono text-xs">
                        {checkout.checkoutSlug}
                      </span>
                    </div>
                    <CheckoutLinkActions
                      checkoutId={checkout.checkoutId}
                      href={checkout.link}
                      previewHref={`/pay/${checkout.checkoutSlug}`}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
