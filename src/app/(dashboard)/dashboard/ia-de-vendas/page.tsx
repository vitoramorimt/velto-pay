import {
  BarChart3,
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { getDashboardOverviewData } from "@/modules/dashboard/application/dashboard-use-cases";
import { formatCentsToCurrency } from "@/modules/products/domain/money";
import { SalesAiChat } from "@/modules/sales-ai/presentation/components/sales-ai-chat";

const suggestions = [
  "Publique primeiro os produtos com promessa mais clara e preço mais simples de entender.",
  "Use o link de checkout diretamente nas páginas de vendas para reduzir passos até a compra.",
  "Quando houver vendas, compare aprovação e reembolsos antes de aumentar tráfego pago.",
  "Revise descrição e página de vendas dos produtos sem conversão após os primeiros acessos.",
];

export default async function SalesAiPage() {
  await requireAuthenticatedUser("/dashboard/ia-de-vendas");

  const dashboard = await getDashboardOverviewData();
  const metrics = [
    {
      label: "Faturamento",
      value: formatCentsToCurrency(dashboard.metrics.totalRevenueCents),
    },
    {
      label: "Vendas aprovadas",
      value: new Intl.NumberFormat("pt-BR").format(
        dashboard.metrics.approvedSales,
      ),
    },
    {
      label: "Produtos ativos",
      value: new Intl.NumberFormat("pt-BR").format(
        dashboard.metrics.activeProducts,
      ),
    },
    {
      label: "Reembolsos",
      value: formatCentsToCurrency(dashboard.metrics.refundsAmountCents),
    },
  ];

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Badge
          className="border-accent/30 bg-accent/10 text-accent"
          variant="outline"
        >
          Assistente Comercial
        </Badge>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.86fr] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Assistente Comercial Velto
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Receba recomendações automáticas com base nos seus produtos,
              vendas, checkouts e movimentações financeiras.
            </p>
          </div>
          <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 shadow-[0_18px_60px_hsl(var(--accent)/0.08)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-background/70 text-accent">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Análise comercial guiada</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  O assistente cruza produtos, pedidos, checkouts e financeiro
                  para sugerir próximos passos de operação e conversão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="velto-card" key={metric.label}>
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="velto-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
                <UserRound className="h-4 w-4" />
              </span>
              Persona principal
            </CardTitle>
            <CardDescription>
              Perfil de operação para orientar suas próximas decisões
              comerciais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Produtor digital que precisa publicar ofertas rapidamente,
              compartilhar checkout próprio e acompanhar sinais comerciais sem
              depender de várias ferramentas.
            </p>
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-4">
              <p className="font-medium text-foreground">Foco sugerido</p>
              <p className="mt-1">
                Clareza de oferta, link de checkout simples e análise semanal
                dos primeiros pedidos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="velto-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
                <Target className="h-4 w-4" />
              </span>
              Sugestões para melhorar conversão
            </CardTitle>
            <CardDescription>
              Recomendações práticas para revisar oferta, checkout e primeiros
              sinais comerciais.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <div
                className="rounded-lg border border-border/80 bg-muted/25 p-4 text-sm leading-6 transition-all hover:-translate-y-0.5 hover:border-accent/25"
                key={suggestion}
              >
                <Lightbulb className="mb-3 h-4 w-4 text-accent" />
                {suggestion}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <SalesAiChat />

      {!dashboard.hasAnyData ? (
        <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 text-sm leading-6 text-muted-foreground">
          <Sparkles className="mb-3 h-4 w-4 text-accent" />
          Assim que produtos e vendas existirem, o Assistente Comercial Velto
          passa a orientar próximos passos com mais precisão.
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
          <BarChart3 className="mb-3 h-4 w-4 text-accent" />
          Os números acima orientam as respostas do Assistente Comercial Velto e
          ajudam a priorizar ações de conversão.
        </div>
      )}
    </div>
  );
}
