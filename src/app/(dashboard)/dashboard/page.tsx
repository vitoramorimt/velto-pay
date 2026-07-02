import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Users,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardOverviewData } from "@/modules/dashboard/application/dashboard-use-cases";
import type {
  DashboardMetrics,
  DashboardOrderStatus,
  DashboardSale,
} from "@/modules/dashboard/domain/types";
import { LogoutButton } from "@/modules/auth/presentation/components/logout-button";

const dashboardCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

const dashboardNumberFormatter = new Intl.NumberFormat("pt-BR");

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function getMetricCards(metrics: DashboardMetrics) {
  return [
    {
      description: "Soma dos pedidos aprovados",
      icon: CircleDollarSign,
      label: "Receita total",
      tone: "text-success",
      value: formatCents(metrics.totalRevenueCents),
    },
    {
      description: "Pedidos pagos confirmados",
      icon: ShoppingCart,
      label: "Vendas aprovadas",
      tone: "text-primary",
      value: dashboardNumberFormatter.format(metrics.approvedSales),
    },
    {
      description: "Pedidos aguardando pagamento",
      icon: Clock3,
      label: "Vendas pendentes",
      tone: "text-warning",
      value: dashboardNumberFormatter.format(metrics.pendingSales),
    },
    {
      description: "Produtos publicados para venda",
      icon: PackageCheck,
      label: "Produtos ativos",
      tone: "text-success",
      value: dashboardNumberFormatter.format(metrics.activeProducts),
    },
    {
      description: "Clientes unicos com pedidos",
      icon: Users,
      label: "Clientes",
      tone: "text-primary",
      value: dashboardNumberFormatter.format(metrics.customers),
    },
  ];
}

function formatCents(amountCents: number): string {
  return dashboardCurrencyFormatter.format(amountCents / 100);
}

function formatRelativeTime(date: Date, now = new Date()): string {
  const diffInSeconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return "agora";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `ha ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `ha ${diffInHours}h`;
  }

  return shortDateFormatter.format(date);
}

function getStatusLabel(status: DashboardOrderStatus): string {
  const labels: Record<DashboardOrderStatus, string> = {
    canceled: "Cancelada",
    chargeback: "Chargeback",
    expired: "Expirada",
    failed: "Falhou",
    paid: "Aprovada",
    pending: "Pendente",
    refunded: "Reembolsada",
  };

  return labels[status];
}

function getStatusVariant(
  status: DashboardOrderStatus,
): "destructive" | "muted" | "success" | "warning" {
  if (status === "paid") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  if (
    status === "failed" ||
    status === "canceled" ||
    status === "expired" ||
    status === "chargeback"
  ) {
    return "destructive";
  }

  return "muted";
}

function getSaleTime(sale: DashboardSale): string {
  return formatRelativeTime(new Date(sale.createdAt));
}

export default async function DashboardPage() {
  const dashboard = await getDashboardOverviewData();
  const metricCards = getMetricCards(dashboard.metrics);
  const chartTotalCents = dashboard.chart.reduce(
    (total, item) => total + item.amountCents,
    0,
  );
  const peakChartPoint = dashboard.chart.reduce(
    (peak, item) => (item.amountCents > peak.amountCents ? item : peak),
    dashboard.chart[0],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="velto-surface overflow-hidden rounded-lg p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge variant="success">Overview</Badge>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-3xl">
              Dashboard principal
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Visao executiva com dados reais do produtor autenticado para
              acompanhar receita, vendas, produtos e atividade recente.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="mt-2 text-2xl">
                    {metric.value}
                  </CardTitle>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Icon className={`h-5 w-5 ${metric.tone}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Receita por dia</CardTitle>
              <CardDescription>
                Pedidos aprovados dos ultimos 7 dias.
              </CardDescription>
            </div>
            <Badge variant="outline">Ultimos 7 dias</Badge>
          </CardHeader>
          <CardContent>
            {dashboard.chart.length > 0 ? (
              <div className="flex min-h-72 flex-col justify-end gap-5">
                <div className="flex h-56 items-end gap-3 rounded-lg border bg-background/70 px-4 py-5 sm:gap-4">
                  {dashboard.chart.map((item) => (
                    <div
                      className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3"
                      key={item.day}
                    >
                      <div className="flex flex-1 items-end">
                        <div
                          aria-label={`${item.day}: ${formatCents(
                            item.amountCents,
                          )}`}
                          className="w-full rounded-t-md bg-primary/85 shadow-sm shadow-primary/20 transition-colors hover:bg-primary"
                          style={{ height: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-center text-xs text-muted-foreground">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="rounded-md border bg-background/70 p-3">
                    <p className="text-xs uppercase">Pico</p>
                    <p className="mt-1 font-medium text-foreground">
                      {peakChartPoint?.day ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-md border bg-background/70 p-3">
                    <p className="text-xs uppercase">Receita 7 dias</p>
                    <p className="mt-1 font-medium text-foreground">
                      {formatCents(chartTotalCents)}
                    </p>
                  </div>
                  <div className="rounded-md border bg-background/70 p-3">
                    <p className="text-xs uppercase">Maior dia</p>
                    <p className="mt-1 flex items-center gap-1 font-medium text-success">
                      <ArrowUpRight className="h-4 w-4" />
                      {formatCents(peakChartPoint?.amountCents ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                description="O grafico sera exibido quando houver eventos suficientes para compor uma serie."
                icon={BarChart3}
                title="Sem dados de grafico"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Ultimas vendas</CardTitle>
              <CardDescription>
                Pedidos mais recentes do produtor autenticado.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.latestSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.latestSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <ReceiptText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {sale.customer}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {sale.product} - {getSaleTime(sale)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sale.status)}>
                          {getStatusLabel(sale.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCents(sale.amountCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                description="As vendas mais recentes vao aparecer aqui assim que houver pedidos para este produtor."
                icon={ReceiptText}
                title="Nenhuma venda recente"
              />
            )}
          </CardContent>
        </Card>
      </section>

      {!dashboard.hasAnyData ? (
        <EmptyState
          description="Os indicadores permanecem zerados ate que este produtor tenha produtos ativos ou pedidos registrados."
          icon={Sparkles}
          title="Nenhum dado para exibir"
        />
      ) : null}
    </div>
  );
}
