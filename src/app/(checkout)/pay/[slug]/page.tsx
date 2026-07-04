import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";

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
import { createPendingCheckoutOrderAction } from "@/modules/checkout/presentation/public-actions";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

type PublicCheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    erro?: string;
    pedido?: string;
  }>;
};

export default async function PublicCheckoutPage({
  params,
  searchParams,
}: PublicCheckoutPageProps) {
  const { slug } = await params;
  const checkout = await getPublicCheckoutBySlug(slug);
  const query = await searchParams;

  if (!checkout) {
    notFound();
  }

  const { product } = checkout;
  const hasImage = Boolean(product.image_url);
  const showSuccess = query?.pedido === "criado";
  const showError = query?.erro === "pedido";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--accent)/0.16),transparent_34rem),radial-gradient(circle_at_80%_10%,hsl(var(--foreground)/0.05),transparent_30rem)]" />
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
            Checkout seguro
          </Badge>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">
          <div className="min-w-0">
            <div
              className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-muted/35 shadow-soft-lg"
              style={
                hasImage
                  ? {
                      backgroundImage: `linear-gradient(rgba(3, 7, 18, 0.18), rgba(3, 7, 18, 0.18)), url(${product.image_url})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }
                  : undefined
              }
            >
              {!hasImage ? (
                <div className="grid place-items-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-background/80 text-accent">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Produto digital Velto Pay
                  </p>
                </div>
              ) : null}
            </div>

            <Badge className="mt-6" variant="secondary">
              Produto digital
            </Badge>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {product.description ||
                "Oferta digital disponível para compra com a experiência Velto Pay."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "Acesso digital",
                "Compra protegida",
                "Suporte do produtor",
              ].map((item) => (
                <div
                  className="rounded-lg border border-border/80 bg-card/80 p-4 text-sm text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/25"
                  key={item}
                >
                  <Sparkles className="mb-3 h-4 w-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="velto-card overflow-hidden shadow-soft-lg">
            <CardHeader className="border-b border-border/80 bg-muted/35">
              <CardTitle>Finalizar compra</CardTitle>
              <CardDescription>
                Informe seus dados para iniciar o pedido.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 sm:p-6">
              {showSuccess ? (
                <div
                  className="rounded-lg border border-success/25 bg-success/10 p-4 text-sm text-success"
                  role="status"
                >
                  Pedido iniciado com sucesso. Enviamos os próximos passos para
                  o e-mail informado.
                </div>
              ) : null}

              {showError ? (
                <div
                  className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"
                  role="alert"
                >
                  Não foi possível iniciar o pedido. Revise seus dados e tente
                  novamente.
                </div>
              ) : null}

              <div className="rounded-lg border border-border/80 bg-background/80 p-4">
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

              <form
                action={createPendingCheckoutOrderAction}
                className="grid gap-4"
              >
                <input name="slug" type="hidden" value={checkout.checkoutSlug} />

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="customerName">
                    Nome
                  </label>
                  <input
                    className="h-11 rounded-md border border-input bg-background/80 px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    id="customerName"
                    maxLength={120}
                    minLength={2}
                    name="customerName"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="customerEmail"
                  >
                    E-mail
                  </label>
                  <input
                    className="h-11 rounded-md border border-input bg-background/80 px-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    id="customerEmail"
                    maxLength={254}
                    name="customerEmail"
                    placeholder="voce@email.com"
                    required
                    type="email"
                  />
                </div>

                <Button className="h-11" type="submit">
                  <ShieldCheck />
                  Comprar
                </Button>
              </form>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-accent/20 bg-accent/10 p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">Garantia</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    O produtor mantém a política de garantia informada na
                    oferta.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <Lock className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">Dados protegidos</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Suas informações são usadas apenas para processar este
                    pedido.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
