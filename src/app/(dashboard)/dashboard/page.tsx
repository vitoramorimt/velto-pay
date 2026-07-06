import {
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  RefreshCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardOverviewData } from "@/modules/dashboard/application/dashboard-use-cases";
import type {
  DashboardChartPoint,
  DashboardMetrics,
} from "@/modules/dashboard/domain/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});
const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatCents(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function getMetricCards(metrics: DashboardMetrics) {
  return [
    {
      description: "Total aprovado no período analisado.",
      icon: CircleDollarSign,
      label: "Faturamento",
      value: formatCents(metrics.totalRevenueCents),
    },
    {
      description: "Pedidos pagos confirmados.",
      icon: BadgeCheck,
      label: "Vendas aprovadas",
      value: formatNumber(metrics.approvedSales),
    },
    {
      description: "Pedidos reembolsados.",
      icon: RefreshCcw,
      label: "Reembolsos",
      value: formatCents(metrics.refundsAmountCents),
    },
    {
      description: "Produtos prontos para gerar checkout.",
      icon: PackageCheck,
      label: "Produtos ativos",
      value: formatNumber(metrics.activeProducts),
    },
  ];
}

export default async function DashboardPage() {
  const dashboard = await getDashboardOverviewData();
  const metricCards = getMetricCards(dashboard.metrics);

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Badge
          className="border-accent/25 bg-accent/10 text-accent"
          variant="outline"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Visão geral
        </Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Dashboard comercial
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Acompanhe seus principais indicadores em tempo real e identifique
              onde concentrar a próxima ação comercial.
            </p>
          </div>
          <div className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-accent shadow-[0_18px_52px_hsl(var(--accent)/0.10)] sm:px-4 sm:py-3">
            Últimos 30 dias
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric, index) => (
          <MetricCard key={metric.label} index={index} {...metric} />
        ))}
      </section>

      <RevenueChart data={dashboard.chart} />
    </div>
  );
}

type MetricCardProps = {
  description: string;
  icon: LucideIcon;
  index: number;
  label: string;
  value: string;
};

function MetricCard({
  description,
  icon: Icon,
  index,
  label,
  value,
}: MetricCardProps) {
  return (
    <Card
      className="velto-card overflow-hidden"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <CardHeader className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
              {label}
            </CardDescription>
            <CardTitle className="mt-2 truncate text-2xl sm:text-3xl">
              {value}
            </CardTitle>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent shadow-[0_0_44px_hsl(var(--accent)/0.12)]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  );
}

function RevenueChart({ data }: { data: DashboardChartPoint[] }) {
  const totalCents = data.reduce((total, item) => total + item.amountCents, 0);
  const totalSales = data.reduce(
    (total, item) => total + item.approvedSales,
    0,
  );

  return (
    <Card className="velto-card overflow-hidden">
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
              <BarChart3 className="h-4 w-4" />
            </span>
            Faturamento por período
          </CardTitle>
          <CardDescription className="mt-2">
            Faturamento e vendas aprovadas nos últimos 30 dias.
          </CardDescription>
        </div>
        <Badge className="border-accent/30 bg-accent/10 text-accent" variant="outline">
          Atualizado
        </Badge>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid gap-5">
            <div className="relative grid h-64 grid-cols-[repeat(30,minmax(0,1fr))] items-end gap-1 overflow-hidden rounded-lg border border-border/80 bg-[linear-gradient(180deg,hsl(var(--muted)/0.58),hsl(var(--muted)/0.22))] px-3 py-4 sm:h-80 sm:gap-2 sm:px-4 sm:py-5">
              <div className="pointer-events-none absolute inset-x-0 top-1/4 border-t border-dashed border-border/70" />
              <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border/60" />
              <div className="pointer-events-none absolute inset-x-0 top-3/4 border-t border-dashed border-border/50" />
              {data.map((item, index) => (
                <div
                  className="flex h-full min-w-0 flex-col justify-end gap-3"
                  key={item.day}
                >
                  <div className="flex flex-1 items-end">
                    <div
                      aria-label={`${item.day}: ${formatCents(item.amountCents)} e ${formatNumber(item.approvedSales)} vendas`}
                      className="w-full rounded-t-md bg-gradient-to-t from-accent/70 via-accent to-emerald-200 shadow-[0_0_28px_hsl(var(--accent)/0.20)] transition-all duration-300 hover:from-accent hover:to-white"
                      style={{ height: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-muted-foreground">
                      {index % 5 === 0 || index === data.length - 1
                        ? item.day
                        : ""}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {formatNumber(item.approvedSales)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SignalTile
                label="Faturamento no gráfico"
                value={formatCents(totalCents)}
              />
              <SignalTile
                label="Vendas aprovadas no gráfico"
                value={formatNumber(totalSales)}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            className="border-accent/20 bg-accent/5"
            description="Assim que sua primeira venda for aprovada, seus indicadores de faturamento e vendas aparecerão aqui."
            icon={BarChart3}
            title="Sem dados para o gráfico"
          />
        )}
      </CardContent>
    </Card>
  );
}

function SignalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/25 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}
