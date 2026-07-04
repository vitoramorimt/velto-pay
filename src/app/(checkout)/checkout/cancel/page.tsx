import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

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

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--accent)/0.12),transparent_34rem),radial-gradient(circle_at_80%_10%,hsl(var(--foreground)/0.05),transparent_30rem)]" />
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
          <Badge variant="outline">Pagamento não concluído</Badge>
        </header>

        <section className="grid flex-1 place-items-center py-12">
          <Card className="velto-card w-full overflow-hidden text-center shadow-soft-lg">
            <CardHeader className="items-center border-b border-border/80 bg-muted/35 px-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/80 text-muted-foreground">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <CardTitle className="mt-4 text-2xl">
                Compra cancelada
              </CardTitle>
              <CardDescription className="max-w-md text-sm leading-6">
                Nenhuma venda foi contabilizada. Você pode voltar ao checkout e
                tentar novamente quando quiser.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <Button asChild className="h-11" variant="secondary">
                <Link href="/">
                  <ArrowLeft />
                  Voltar para a Velto Pay
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
