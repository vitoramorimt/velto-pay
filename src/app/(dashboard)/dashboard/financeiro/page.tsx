import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  CreditCard,
  History,
  Landmark,
  LockKeyhole,
  ReceiptText,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  WalletCards,
  type LucideIcon,
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
import type { WalletFinanceMetrics } from "@/modules/wallet/application/wallet-use-cases";
import { formatCentsToCurrency } from "@/modules/products/domain/money";
import { WithdrawalRequestDialog } from "@/modules/wallet/presentation/components/withdrawal-request-dialog";
import type { WalletTransaction } from "@/modules/wallet/domain/types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getTransactionTypeLabel(type: WalletTransaction["type"]): string {
  const labels: Record<WalletTransaction["type"], string> = {
    adjustment: "Ajuste",
    chargeback: "Chargeback",
    platform_fee: "Taxa Velto",
    refund: "Reembolso",
    sale: "Venda",
    withdrawal: "Saque",
    withdrawal_cancelled: "Saque cancelado",
  };

  return labels[type];
}

function getTransactionStatusLabel(
  status: WalletTransaction["status"],
): string {
  const labels: Record<WalletTransaction["status"], string> = {
    available: "Disponível",
    cancelled: "Cancelado",
    failed: "Falhou",
    paid: "Pago",
    pending: "Pendente",
    processing: "Processando",
  };

  return labels[status];
}

function getTransactionStatusVariant(status: WalletTransaction["status"]) {
  if (status === "available" || status === "paid") {
    return "success" as const;
  }

  if (status === "failed" || status === "cancelled") {
    return "destructive" as const;
  }

  return "warning" as const;
}

function getTransactionAmount(transaction: WalletTransaction): number {
  return transaction.net_amount_cents || transaction.gross_amount_cents;
}

export default async function FinancePage() {
  const data = await getFinancePageData();

  if (data.state !== "ready") {
    return (
      <div className="velto-page-shell">
        <EmptyState
          description="Não conseguimos localizar sua área comercial agora. Saia da conta e entre novamente para atualizar o acesso."
          icon={ShieldAlert}
          title="Financeiro indisponível"
        />
      </div>
    );
  }

  const metrics = [
    {
      description: "Valores liberados para saque.",
      icon: WalletCards,
      label: "Saldo disponível",
      value: formatCentsToCurrency(data.metrics.availableBalanceCents),
    },
    {
      description: "Valores em processamento.",
      icon: LockKeyhole,
      label: "Saldo pendente",
      value: formatCentsToCurrency(data.metrics.pendingBalanceCents),
    },
    {
      description: "Total líquido recebido na carteira.",
      icon: BadgeCheck,
      label: "Total recebido",
      value: formatCentsToCurrency(data.metrics.totalReceivedCents),
    },
    {
      description: "Solicitações de saque registradas.",
      icon: Landmark,
      label: "Total sacado",
      value: formatCentsToCurrency(data.metrics.totalWithdrawnCents),
    },
    {
      description: "Taxas descontadas das vendas aprovadas.",
      icon: ReceiptText,
      label: "Taxas pagas",
      value: formatCentsToCurrency(data.metrics.totalFeesPaidCents),
    },
    {
      description: "Volume aprovado antes de taxas e ajustes.",
      icon: CircleDollarSign,
      label: "Receita bruta",
      value: formatCentsToCurrency(data.metrics.grossRevenueCents),
    },
    {
      description: "Valor estimado após taxas, reembolsos e chargebacks.",
      icon: CreditCard,
      label: "Receita líquida",
      value: formatCentsToCurrency(data.metrics.netRevenueCents),
    },
    {
      description: "Valores devolvidos ou disputados.",
      icon: RefreshCcw,
      label: "Reembolsos e chargebacks",
      value: formatCentsToCurrency(
        data.metrics.refundsCents + data.metrics.chargebacksCents,
      ),
    },
  ];

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge
              className="border-accent/25 bg-accent/10 text-accent"
              variant="outline"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Carteira
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Financeiro
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Veja quanto está disponível, quanto ainda está em processamento e
              solicite saques para qualquer chave Pix.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/dashboard/configuracoes/recebimentos">
                Recebimentos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <WithdrawalRequestDialog
              availableBalanceCents={data.metrics.availableBalanceCents}
              settings={data.withdrawalSettings}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            Últimas movimentações
          </CardTitle>
          <CardDescription>
            Vendas, reembolsos, chargebacks e saques registrados na sua
            carteira.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.transactions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.slice(0, 20).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell className="min-w-56">
                        {transaction.description ?? "Movimentação financeira"}
                      </TableCell>
                      <TableCell>
                        {getTransactionTypeLabel(transaction.type)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getTransactionStatusVariant(
                            transaction.status,
                          )}
                        >
                          {getTransactionStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCentsToCurrency(
                          getTransactionAmount(transaction),
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              description="Quando suas vendas forem aprovadas, os valores aparecerão aqui. Você verá o bruto, as taxas e o líquido disponível para saque."
              icon={History}
              title="Nenhuma movimentação financeira"
            />
          )}
        </CardContent>
      </Card>
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
      <CardHeader className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardDescription className="text-xs font-medium uppercase tracking-[0.16em]">
              {label}
            </CardDescription>
            <CardTitle className="mt-2 truncate text-2xl">{value}</CardTitle>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  );
}

function FinancialFlowChart({ metrics }: { metrics: WalletFinanceMetrics }) {
  const rows = [
    {
      label: "Saldo disponível",
      value: metrics.availableBalanceCents,
    },
    {
      label: "Saldo pendente",
      value: metrics.pendingBalanceCents,
    },
    {
      label: "Total recebido",
      value: metrics.totalReceivedCents,
    },
    {
      label: "Taxas pagas",
      value: metrics.totalFeesPaidCents,
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
          Fluxo da carteira
        </CardTitle>
        <CardDescription>
          Comparativo visual dos principais saldos da sua operação.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rows.map((row) => {
          const percentage = Math.max(
            4,
            Math.round((Math.abs(row.value) / maxValue) * 100),
          );

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
