import { ExternalLink, Link2, ShieldAlert, Sparkles } from "lucide-react";

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
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Badge
          className="border-accent/25 bg-accent/10 text-accent"
          variant="outline"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Checkout
        </Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Links de checkout
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie links públicos, status e prévias dos checkouts vinculados
              aos seus produtos.
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
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
        <Card className="velto-card">
          <CardContent className="pt-6">
            <EmptyState
              className="border-accent/20 bg-accent/5"
              description="Crie um produto para gerar automaticamente um link público de checkout."
              icon={Link2}
              title="Nenhum checkout gerado"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="velto-card">
          <CardHeader>
            <CardTitle className="text-xl">Checkouts gerados</CardTitle>
            <CardDescription>
              Checkouts persistidos e prontos para compartilhamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    <TableRow className="transition-colors" key={checkout.checkoutId}>
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
                        <Badge
                          className="border-accent/25 bg-accent/10 text-accent"
                          variant="outline"
                        >
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
                <Card
                  className="min-w-0 border-border/80 bg-card/80"
                  key={checkout.checkoutId}
                >
                  <CardHeader className="gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate">
                          {checkout.checkoutName}
                        </CardTitle>
                        <CardDescription className="mt-1 truncate">
                          {checkout.link}
                        </CardDescription>
                      </div>
                      <Badge
                        className="border-accent/25 bg-accent/10 text-accent"
                        variant="outline"
                      >
                        {getCheckoutStatusLabel(checkout.checkoutStatus)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="min-w-0 max-w-[52vw] truncate font-medium">
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
                    <div className="grid gap-1 text-sm">
                      <span className="text-muted-foreground">Slug</span>
                      <span className="truncate font-mono text-xs">
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
