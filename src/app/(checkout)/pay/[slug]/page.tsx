import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, Lock, ShieldCheck, Sparkles } from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicCheckoutBySlug } from "@/modules/checkout/application/checkout-use-cases";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

type PublicCheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicCheckoutPage({
  params,
}: PublicCheckoutPageProps) {
  const { slug } = await params;
  const product = await getPublicCheckoutBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(25,205,139,0.16),transparent_34rem),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.10),transparent_30rem)]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            aria-label="Velto Pay"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            href="/"
          >
            <VeltoLogo
              imageClassName="rounded-md"
              labelClassName="text-sm text-foreground"
              showLabel
              size={38}
            />
          </Link>
          <Badge
            className="border-accent/30 bg-accent/10 text-accent"
            variant="outline"
          >
            Checkout MVP
          </Badge>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div>
            <Badge variant="secondary">Produto digital</Badge>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-normal sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {product.description ||
                "Prévia inicial do checkout público da Velto Pay para este produto."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "Ambiente seguro",
                "Checkout próprio",
                "Pagamento em breve",
              ].map((item) => (
                <div
                  className="rounded-lg border border-border bg-card/80 p-4 text-sm text-muted-foreground shadow-sm"
                  key={item}
                >
                  <Sparkles className="mb-3 h-4 w-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden shadow-soft-lg">
            <CardHeader className="border-b bg-muted/35">
              <CardTitle>Finalizar compra</CardTitle>
              <CardDescription>
                Confira os dados antes de avançar para a etapa de pagamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 sm:p-6">
              <div className="rounded-lg border bg-background/80 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Acesso ao produto digital
                    </p>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatCentsToCurrency(product.price_cents)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-accent/20 bg-accent/10 p-4">
                  <CreditCard className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">Pagamento visual</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Pix e cartão serão habilitados em sprint futura.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <Lock className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">Dados protegidos</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Nenhum pagamento real é processado nesta prévia.
                  </p>
                </div>
              </div>

              <Button className="h-11" disabled type="button">
                <ShieldCheck />
                Pagamento real ainda não está ativo
              </Button>

              <p className="text-center text-xs leading-5 text-muted-foreground">
                Esta é uma prévia pública do checkout da Velto Pay. Pix, cartão
                e webhooks ainda não foram implementados.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
