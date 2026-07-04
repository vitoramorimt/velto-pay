import {
  BarChart3,
  Bot,
  BrainCircuit,
  Lightbulb,
  MessageSquareText,
  Send,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { getDashboardOverviewData } from "@/modules/dashboard/application/dashboard-use-cases";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

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
          Prévia MVP
        </Badge>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.86fr] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              IA de Vendas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Uma área inicial para analisar métricas, entender a persona e
              organizar sugestões de conversão. Ainda não há IA real conectada.
            </p>
          </div>
          <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 shadow-[0_18px_60px_hsl(var(--accent)/0.08)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-background/70 text-accent">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Análise comercial assistida</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A tela usa seus números reais como contexto visual, mas as
                  recomendações ainda são estáticas no MVP.
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
              Hipótese base para orientar o produtor digital no MVP.
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
              Recomendações estáticas enquanto a IA real não está ativa.
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

      <Card className="velto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
              <MessageSquareText className="h-4 w-4" />
            </span>
            Perguntar à IA
          </CardTitle>
          <CardDescription>
            Campo visual/mockado. A resposta automática será integrada em etapa
            futura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/80 bg-muted/25 p-4">
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-accent/20 bg-background/70 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Bot className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Prévia MVP: faça perguntas sobre métricas, persona e conversão
                quando a IA real for conectada.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                disabled
                placeholder="Ex.: como posso melhorar a conversão deste produto?"
              />
              <Button disabled type="button">
                <Send />
                Prévia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!dashboard.hasAnyData ? (
        <div className="rounded-lg border border-accent/20 bg-accent/10 p-4 text-sm leading-6 text-muted-foreground">
          <Sparkles className="mb-3 h-4 w-4 text-accent" />
          Assim que produtos e vendas reais existirem, esta área poderá cruzar
          números comerciais com recomendações mais úteis.
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
          <BarChart3 className="mb-3 h-4 w-4 text-accent" />
          Os números acima já refletem o produtor autenticado e servem como base
          visual para a futura IA real.
        </div>
      )}
    </div>
  );
}
