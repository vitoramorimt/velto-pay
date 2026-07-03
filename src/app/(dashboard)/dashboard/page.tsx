import {
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  PackageCheck,
  RefreshCcw,
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
      label: "Reembolso",
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="velto-surface rounded-lg p-6 sm:p-8">
        <Badge variant="secondary">Visão geral</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
              Dashboard comercial
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Acompanhe os principais sinais da sua operação com dados reais do
              produtor autenticado.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
            Atualização baseada em pedidos e produtos do Supabase.
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <RevenueChart data={dashboard.chart} />
    </div>
  );
}

type MetricCardProps = {
  description: string;
  icon: LucideIcon;
  label: string;
  value: string;
};

function MetricCard({
  description,
  icon: Icon,
  label,
  value,
}: MetricCardProps) {
  return (
    <Card className="transition-colors hover:border-accent/30">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription>{label}</CardDescription>
            <CardTitle className="mt-2 truncate text-2xl">{value}</CardTitle>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-accent">
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
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            Faturamento por período
          </CardTitle>
          <CardDescription>
            Faturamento e vendas aprovadas nos últimos 7 dias.
          </CardDescription>
        </div>
        <Badge
          className="border-accent/30 bg-accent/10 text-accent"
          variant="outline"
        >
          Dados reais
        </Badge>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid gap-5">
            <div className="flex h-72 items-end gap-3 rounded-lg border bg-muted/25 px-4 py-5 sm:gap-4">
              {data.map((item) => (
                <div
                  className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3"
                  key={item.day}
                >
                  <div className="flex flex-1 items-end">
                    <div
                      aria-label={`${item.day}: ${formatCents(item.amountCents)} e ${formatNumber(item.approvedSales)} vendas`}
                      className="w-full rounded-t-md bg-gradient-to-t from-accent/75 to-emerald-300 shadow-[0_0_28px_rgba(25,205,139,0.18)] transition-all hover:from-accent hover:to-emerald-200"
                      style={{ height: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-muted-foreground">
                      {item.day}
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
            description="Quando houver vendas aprovadas para este produtor, o gráfico exibirá faturamento e quantidade por período."
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
    <div className="rounded-lg border bg-muted/25 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}
