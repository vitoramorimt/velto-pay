import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  BarChart3,
  CircleDollarSign,
  Clock3,
  CreditCard,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
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
import {
  getDashboardOverviewData,
  parseDashboardFilters,
} from "@/modules/dashboard/application/dashboard-use-cases";
import type {
  DashboardApprovalMethod,
  DashboardBreakdownItem,
  DashboardChartPoint,
  DashboardMetrics,
  DashboardOrderStatus,
  DashboardPaymentMethod,
  DashboardSale,
} from "@/modules/dashboard/domain/types";
import { DashboardFilters } from "@/modules/dashboard/presentation/components/dashboard-filters";
import { cn } from "@/shared/utils/cn";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function formatCents(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatPercentage(value: number): string {
  return `${numberFormatter.format(value)}%`;
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
    return `há ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `há ${diffInHours}h`;
  }

  return shortDateFormatter.format(date);
}

function getMetricCards(metrics: DashboardMetrics) {
  return [
    {
      accent: "text-accent",
      description: "Pedidos aprovados menos reembolsos e chargebacks.",
      icon: CircleDollarSign,
      label: "Faturamento líquido",
      value: formatCents(metrics.netRevenueCents),
    },
    {
      accent: "text-success",
      description: "Pedidos pagos confirmados no período filtrado.",
      icon: BadgeCheck,
      label: "Vendas aprovadas",
      value: formatNumber(metrics.approvedSales),
    },
    {
      accent: "text-warning",
      description: "Pedidos aguardando confirmação de pagamento.",
      icon: Clock3,
      label: "Vendas pendentes",
      value: formatNumber(metrics.pendingSales),
    },
    {
      accent: "text-sky-300",
      description: `${formatNumber(metrics.refunds)} pedidos reembolsados.`,
      icon: RefreshCcw,
      label: "Reembolsos",
      value: formatCents(metrics.refundsAmountCents),
    },
    {
      accent: "text-destructive",
      description: `${formatNumber(metrics.chargebacks)} contestações.`,
      icon: Ban,
      label: "Chargebacks",
      value: formatCents(metrics.chargebackAmountCents),
    },
    {
      accent: "text-accent",
      description: "Vendas aprovadas sobre pedidos registrados.",
      icon: ShieldCheck,
      label: "Taxa de aprovação",
      value: formatPercentage(metrics.approvalRate),
    },
    {
      accent: "text-primary",
      description: "Sem eventos de visita conectados nesta etapa.",
      icon: Target,
      label: "Conversão",
      value: formatPercentage(metrics.conversionRate),
    },
    {
      accent: "text-emerald-300",
      description: "Média dos pedidos aprovados.",
      icon: CreditCard,
      label: "Ticket médio",
      value: formatCents(metrics.averageTicketCents),
    },
    {
      accent: "text-success",
      description: "Produtos ativos do produtor autenticado.",
      icon: PackageCheck,
      label: "Produtos ativos",
      value: formatNumber(metrics.activeProducts),
    },
    {
      accent: "text-primary",
      description: "Clientes únicos com pedidos registrados.",
      icon: Users,
      label: "Clientes",
      value: formatNumber(metrics.customers),
    },
  ];
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

function getPaymentMethodLabel(method: DashboardPaymentMethod | null): string {
  const labels: Record<DashboardPaymentMethod, string> = {
    boleto: "Boleto",
    credit_card: "Cartão",
    pix: "Pix",
  };

  return method ? labels[method] : "Não informado";
}

function getSaleTime(sale: DashboardSale): string {
  return formatRelativeTime(new Date(sale.createdAt));
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const filters = parseDashboardFilters((await searchParams) ?? {});
  const dashboard = await getDashboardOverviewData(filters);
  const metricCards = getMetricCards(dashboard.metrics);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#030806] text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_20%_0%,rgba(43,224,146,0.18),transparent_34rem),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.10),transparent_30rem)]" />
      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 p-5 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <Badge
                className="border-accent/30 bg-accent/10 text-accent"
                variant="outline"
              >
                Dashboard
              </Badge>
              <h1 className="mt-4 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                Visão principal da operação
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Métricas reais do produtor autenticado para acompanhar receita,
                vendas, produtos e clientes sem valores compartilhados entre
                contas.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
              <HeroSignal
                label="Faturamento líquido"
                value={formatCents(dashboard.metrics.netRevenueCents)}
              />
              <HeroSignal
                label="Aprovação"
                value={formatPercentage(dashboard.metrics.approvalRate)}
              />
              <HeroSignal
                label="Ticket médio"
                value={formatCents(dashboard.metrics.averageTicketCents)}
              />
            </div>
          </div>
          <div className="border-t border-white/10 p-4 sm:p-5">
            <DashboardFilters
              filters={dashboard.filters}
              productOptions={dashboard.productOptions}
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <RevenueChart data={dashboard.chart} />
          <LatestSalesTable sales={dashboard.latestSales} />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <BreakdownCard
            data={dashboard.byMethod}
            emptyDescription="As vendas aprovadas serão agrupadas por Pix, cartão ou boleto quando existirem pedidos."
            emptyTitle="Sem vendas por método"
            icon={CreditCard}
            title="Vendas por método de pagamento"
          />
          <BreakdownCard
            data={dashboard.byProduct}
            emptyDescription="Os produtos com vendas aprovadas aparecerão aqui, respeitando o produtor autenticado."
            emptyTitle="Sem vendas por produto"
            icon={PackageCheck}
            title="Vendas por produto"
          />
          <BreakdownCard
            data={dashboard.bySource}
            emptyDescription="Nenhuma fonte foi encontrada nos metadados dos pedidos filtrados."
            emptyTitle="Sem vendas por fonte"
            icon={TrendingUp}
            title="Vendas por fonte"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <ApprovalByMethod data={dashboard.approvalByMethod} />
          <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-accent" />
                Saúde dos dados
              </CardTitle>
              <CardDescription className="text-slate-400">
                Leitura do estado atual sem preencher lacunas com dados
                simulados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!dashboard.hasAnyData ? (
                <EmptyState
                  className="border-white/10 bg-white/[0.03] text-slate-100"
                  description="Os indicadores permanecem zerados até que este produtor tenha produtos ativos ou pedidos registrados."
                  icon={Sparkles}
                  title="Nenhum dado para exibir"
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <SignalTile
                    label="Pedidos filtrados"
                    value={formatNumber(
                      dashboard.metrics.approvedSales +
                        dashboard.metrics.pendingSales +
                        dashboard.metrics.refunds +
                        dashboard.metrics.chargebacks,
                    )}
                  />
                  <SignalTile
                    label="Produtos no filtro"
                    value={formatNumber(dashboard.metrics.activeProducts)}
                  />
                  <SignalTile
                    label="Clientes únicos"
                    value={formatNumber(dashboard.metrics.customers)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

type HeroSignalProps = {
  label: string;
  value: string;
};

function HeroSignal({ label, value }: HeroSignalProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

type MetricCardProps = ReturnType<typeof getMetricCards>[number];

function MetricCard({
  accent,
  description,
  icon: Icon,
  label,
  value,
}: MetricCardProps) {
  return (
    <Card className="group border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.20)] transition-colors hover:border-accent/30 hover:bg-white/[0.065]">
      <CardHeader className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription className="text-slate-400">
              {label}
            </CardDescription>
            <CardTitle className="mt-2 truncate text-2xl text-white">
              {value}
            </CardTitle>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06]">
            <Icon className={cn("h-5 w-5", accent)} />
          </div>
        </div>
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      </CardHeader>
    </Card>
  );
}

function RevenueChart({ data }: { data: DashboardChartPoint[] }) {
  const chartTotalCents = data.reduce(
    (total, item) => total + item.amountCents,
    0,
  );
  const peakChartPoint = data.reduce<DashboardChartPoint | null>(
    (peak, item) =>
      !peak || item.amountCents > peak.amountCents ? item : peak,
    null,
  );

  return (
    <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-4 w-4 text-accent" />
            Faturamento por dia
          </CardTitle>
          <CardDescription className="text-slate-400">
            Série real de pedidos aprovados nos últimos dias.
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
          <div className="flex min-h-72 flex-col justify-end gap-5">
            <div className="flex h-60 items-end gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-5 sm:gap-4">
              {data.map((item) => (
                <div
                  className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3"
                  key={item.day}
                >
                  <div className="flex flex-1 items-end">
                    <div
                      aria-label={`${item.day}: ${formatCents(item.amountCents)}`}
                      className="w-full rounded-t-md bg-gradient-to-t from-accent/70 to-emerald-300 shadow-[0_0_28px_rgba(43,224,146,0.18)] transition-all hover:from-accent hover:to-emerald-200"
                      style={{ height: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-center text-xs text-slate-500">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
              <SignalTile
                label="Receita no gráfico"
                value={formatCents(chartTotalCents)}
              />
              <SignalTile
                label="Dia de pico"
                value={peakChartPoint?.day ?? "-"}
              />
              <SignalTile
                icon={ArrowUpRight}
                label="Maior dia"
                value={formatCents(peakChartPoint?.amountCents ?? 0)}
              />
            </div>
          </div>
        ) : (
          <EmptyState
            className="border-white/10 bg-white/[0.03] text-slate-100"
            description="O gráfico será exibido quando houver pedidos aprovados suficientes no período."
            icon={BarChart3}
            title="Sem dados de gráfico"
          />
        )}
      </CardContent>
    </Card>
  );
}

function LatestSalesTable({ sales }: { sales: DashboardSale[] }) {
  return (
    <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ReceiptText className="h-4 w-4 text-accent" />
          Últimas vendas
        </CardTitle>
        <CardDescription className="text-slate-400">
          Pedidos mais recentes do produtor autenticado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-500">Cliente</TableHead>
                <TableHead className="text-slate-500">Método</TableHead>
                <TableHead className="text-slate-500">Status</TableHead>
                <TableHead className="text-right text-slate-500">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow
                  className="border-white/10 hover:bg-white/[0.035]"
                  key={sale.id}
                >
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-accent">
                        <ReceiptText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {sale.customer}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {sale.product} - {getSaleTime(sale)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {getPaymentMethodLabel(sale.method)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(sale.status)}>
                      {getStatusLabel(sale.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-white">
                    {formatCents(sale.amountCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            className="border-white/10 bg-white/[0.03] text-slate-100"
            description="As vendas mais recentes vão aparecer aqui assim que houver pedidos para este produtor."
            icon={ReceiptText}
            title="Nenhuma venda recente"
          />
        )}
      </CardContent>
    </Card>
  );
}

type BreakdownCardProps = {
  data: DashboardBreakdownItem[];
  emptyDescription: string;
  emptyTitle: string;
  icon: typeof CreditCard;
  title: string;
};

function BreakdownCard({
  data,
  emptyDescription,
  emptyTitle,
  icon: Icon,
  title,
}: BreakdownCardProps) {
  return (
    <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Icon className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.slice(0, 5).map((item) => (
              <BreakdownRow item={item} key={item.label} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="border-white/10 bg-white/[0.03] text-slate-100"
            description={emptyDescription}
            icon={Icon}
            title={emptyTitle}
          />
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownRow({ item }: { item: DashboardBreakdownItem }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{item.label}</p>
          <p className="text-xs text-slate-500">
            {formatNumber(item.count)} vendas
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-white">
            {formatCents(item.amountCents)}
          </p>
          <p className="text-xs text-slate-500">
            {formatPercentage(item.percentage)}
          </p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.max(3, item.percentage)}%` }}
        />
      </div>
    </div>
  );
}

function ApprovalByMethod({ data }: { data: DashboardApprovalMethod[] }) {
  return (
    <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Taxa de aprovação por método
        </CardTitle>
        <CardDescription className="text-slate-400">
          Aprovadas sobre pedidos registrados por forma de pagamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((item) => (
              <div
                className="rounded-lg border border-white/10 bg-black/20 p-4"
                key={item.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(item.approved)} de{" "}
                      {formatNumber(item.total)} aprovadas
                    </p>
                  </div>
                  <Badge
                    className="border-accent/30 bg-accent/10 text-accent"
                    variant="outline"
                  >
                    {formatPercentage(item.percentage)}
                  </Badge>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(3, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            className="border-white/10 bg-white/[0.03] text-slate-100"
            description="A taxa por método aparecerá quando houver pedidos com forma de pagamento registrada."
            icon={ShieldCheck}
            title="Sem aprovação por método"
          />
        )}
      </CardContent>
    </Card>
  );
}

type SignalTileProps = {
  icon?: typeof ArrowDownLeft;
  label: string;
  value: string;
};

function SignalTile({ icon: Icon, label, value }: SignalTileProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
        {Icon ? <Icon className="h-4 w-4 text-accent" /> : null}
        {value}
      </p>
    </div>
  );
}
