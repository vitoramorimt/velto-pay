import {
  BadgeCheck,
  CircleDollarSign,
  History,
  LockKeyhole,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  WalletCards,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFinancePageData } from "@/modules/finance/application/finance-use-cases";
import type {
  FinanceLedgerEntry,
  FinanceMetrics,
} from "@/modules/finance/domain/types";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getEntryTypeLabel(type: FinanceLedgerEntry["type"]): string {
  const labels: Record<FinanceLedgerEntry["type"], string> = {
    adjustment: "Ajuste",
    affiliate_commission: "Comissão de afiliado",
    chargeback: "Chargeback",
    hold: "Retenção",
    platform_fee: "Taxa da plataforma",
    producer_receivable: "Recebível",
    refund: "Reembolso",
    release: "Liberação",
    sale: "Venda",
    withdrawal: "Saque",
    withdrawal_fee: "Taxa de saque",
  };

  return labels[type];
}

export default async function FinancePage() {
  const data = await getFinancePageData();
  const metrics = [
    {
      description: "Total bruto de pedidos pagos.",
      icon: CircleDollarSign,
      label: "Receita Bruta",
      value: formatCentsToCurrency(data.metrics.grossRevenueCents),
    },
    {
      description: "Receita após reembolsos e chargebacks.",
      icon: BadgeCheck,
      label: "Receita Líquida",
      value: formatCentsToCurrency(data.metrics.netRevenueCents),
    },
    {
      description: "Total reembolsado.",
      icon: RefreshCcw,
      label: "Reembolsos",
      value: formatCentsToCurrency(data.metrics.refundsCents),
    },
    {
      description: "Perdas registradas por disputa.",
      icon: TrendingDown,
      label: "Chargebacks",
      value: formatCentsToCurrency(data.metrics.chargebacksCents),
    },
    {
      description: "Créditos liberados no ledger.",
      icon: WalletCards,
      label: "Saldo disponível",
      value: formatCentsToCurrency(data.metrics.availableBalanceCents),
    },
    {
      description: "Créditos retidos por data futura.",
      icon: LockKeyhole,
      label: "Saldo pendente",
      value: formatCentsToCurrency(data.metrics.blockedBalanceCents),
    },
  ];

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Badge
          className="border-accent/25 bg-accent/10 text-accent"
          variant="outline"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Financeiro
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
          Visão financeira
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acompanhe receita, reembolsos, chargebacks e saldos com dados reais
          do Supabase quando existirem.
        </p>
      </section>

      {data.state !== "ready" ? (
        <EmptyState
          description="Não foi possível encontrar um perfil de produtor vinculado à sua conta."
          icon={ShieldAlert}
          title="Financeiro indisponível"
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric, index) => (
              <FinanceMetricCard key={metric.label} index={index} {...metric} />
            ))}
          </section>

          <FinancialFlowChart metrics={data.metrics} />

          <Card className="velto-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
                  <History className="h-4 w-4" />
                </span>
                Histórico financeiro
              </CardTitle>
              <CardDescription>
                Últimas transações vinculadas ao produtor autenticado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.entries.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Direção</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.entries.slice(0, 20).map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDate(entry.createdAt)}</TableCell>
                          <TableCell className="min-w-56">
                            {entry.description}
                          </TableCell>
                          <TableCell>{getEntryTypeLabel(entry.type)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.direction === "credit"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {entry.direction === "credit"
                                ? "Crédito"
                                : "Débito"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCentsToCurrency(entry.amountCents)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  description="Quando houver vendas, reembolsos, chargebacks ou lançamentos financeiros, as transações aparecerão aqui."
                  icon={History}
                  title="Nenhuma transação financeira"
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

type FinanceMetricCardProps = {
  description: string;
  icon: LucideIcon;
  index: number;
  label: string;
  value: string;
};

function FinanceMetricCard({
  description,
  icon: Icon,
  index,
  label,
  value,
}: FinanceMetricCardProps) {
  return (
    <Card
      className="velto-card overflow-hidden"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
              {label}
            </CardDescription>
            <CardTitle className="mt-3 truncate text-2xl">{value}</CardTitle>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  );
}

function FinancialFlowChart({ metrics }: { metrics: FinanceMetrics }) {
  const rows = [
    {
      label: "Receita Bruta",
      value: metrics.grossRevenueCents,
    },
    {
      label: "Receita Líquida",
      value: metrics.netRevenueCents,
    },
    {
      label: "Saldo disponível",
      value: metrics.availableBalanceCents,
    },
    {
      label: "Saldo pendente",
      value: metrics.blockedBalanceCents,
    },
  ];
  const maxValue = Math.max(...rows.map((row) => Math.abs(row.value)), 1);

  return (
    <Card className="velto-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
            <TrendingDown className="h-4 w-4 rotate-180" />
          </span>
          Fluxo financeiro
        </CardTitle>
        <CardDescription>
          Comparativo visual dos principais saldos calculados a partir do banco.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rows.map((row) => {
          const percentage = Math.max(4, Math.round((Math.abs(row.value) / maxValue) * 100));

          return (
            <div className="grid gap-2" key={row.label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{row.label}</span>
                <span className="text-muted-foreground">
                  {formatCentsToCurrency(row.value)}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/60 to-emerald-200 shadow-[0_0_24px_hsl(var(--accent)/0.20)]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
