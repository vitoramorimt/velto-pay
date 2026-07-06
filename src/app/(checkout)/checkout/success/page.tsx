import Link from "next/link";
import { CheckCircle2, Gift, Mail, ShieldCheck } from "lucide-react";

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
import { getCheckoutSuccessContext } from "@/modules/checkout/application/checkout-use-cases";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const query = await searchParams;
  const sessionId = query?.session_id;
  const successContext = await getCheckoutSuccessContext(sessionId);
  const productName = successContext?.product_name ?? "sua compra";
  const recommendedOffers = successContext?.offers ?? [];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--accent)/0.16),transparent_34rem),radial-gradient(circle_at_80%_10%,hsl(var(--foreground)/0.05),transparent_30rem)]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-8">
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
            className="border-success/30 bg-success/10 text-success"
            variant="outline"
          >
            Pagamento recebido
          </Badge>
        </header>

        <section className="grid flex-1 place-items-center py-12">
          <Card className="velto-card w-full overflow-hidden text-center shadow-soft-lg">
            <CardHeader className="items-center border-b border-border/80 bg-muted/35 px-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-success/25 bg-success/10 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="mt-4 text-2xl">
                Obrigado pela compra
              </CardTitle>
              <CardDescription className="max-w-md text-sm leading-6">
                Recebemos a confirmação inicial para {productName}. Você
                receberá as próximas instruções por e-mail.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 p-6">
              {successContext ? (
                <div className="rounded-lg border border-border/80 bg-background/80 p-4 text-left">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Resumo do pedido
                  </p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Produto</span>
                      <span className="font-medium">
                        {successContext.product_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold text-accent">
                        {formatCentsToCurrency(successContext.total_cents)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : sessionId ? (
                <div className="rounded-lg border border-border/80 bg-background/80 p-4 text-left">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Referência da compra
                  </p>
                  <p className="mt-2 break-all text-sm text-foreground">
                    {sessionId}
                  </p>
                </div>
              ) : null}

              {recommendedOffers.length > 0 ? (
                <div className="grid gap-3 text-left">
                  <div>
                    <p className="text-sm font-medium">Ofertas recomendadas</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      O produtor pode ativar ofertas adicionais para aumentar o
                      valor percebido após a compra.
                    </p>
                  </div>
                  {recommendedOffers.map((offer) => (
                    <div
                      className="rounded-lg border border-border/80 bg-background/80 p-4"
                      key={offer.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-accent" />
                            <p className="font-medium">{offer.title}</p>
                          </div>
                          {offer.description ? (
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {offer.description}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-accent">
                          {formatCentsToCurrency(offer.amount_cents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 text-left">
                  <Mail className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">Próximos passos</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Verifique seu e-mail para receber as instruções do produto.
                  </p>
                </div>
                <div className="rounded-lg border p-4 text-left">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-medium">Compra protegida</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    A Velto Pay confirma a venda com segurança antes de liberar
                    as próximas etapas.
                  </p>
                </div>
              </div>

              <Button asChild className="h-11">
                <Link href="/">Voltar para a Velto Pay</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
