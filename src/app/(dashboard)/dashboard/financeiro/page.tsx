import {
  BadgeCheck,
  CircleDollarSign,
  History,
  RefreshCcw,
  ShieldAlert,
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
import type { FinanceLedgerEntry } from "@/modules/finance/domain/types";
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
      description: "Créditos disponíveis no ledger.",
      icon: WalletCards,
      label: "Saldo disponível",
      value: formatCentsToCurrency(data.metrics.availableBalanceCents),
    },
    {
      description: "Pedidos pagos confirmados.",
      icon: CircleDollarSign,
      label: "Faturamento total",
      value: formatCentsToCurrency(data.metrics.totalRevenueCents),
    },
    {
      description: "Total reembolsado.",
      icon: RefreshCcw,
      label: "Reembolsos",
      value: formatCentsToCurrency(data.metrics.refundsCents),
    },
    {
      description: "Quantidade de vendas aprovadas.",
      icon: BadgeCheck,
      label: "Vendas aprovadas",
      value: new Intl.NumberFormat("pt-BR").format(data.metrics.approvedSales),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="velto-surface rounded-lg p-6 sm:p-8">
        <Badge variant="secondary">Financeiro</Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-3xl">
          Visão financeira
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acompanhe saldo, faturamento, reembolsos e vendas aprovadas com dados
          reais quando existirem. Saques e split real ficam para uma próxima
          etapa.
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
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <FinanceMetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4 text-accent" />
                Histórico financeiro
              </CardTitle>
              <CardDescription>
                Lançamentos append-only vinculados ao produtor autenticado.
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
                  description="Quando houver vendas, reembolsos ou lançamentos financeiros, o histórico aparecerá aqui."
                  icon={History}
                  title="Nenhuma movimentação financeira"
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
  label: string;
  value: string;
};

function FinanceMetricCard({
  description,
  icon: Icon,
  label,
  value,
}: FinanceMetricCardProps) {
  return (
    <Card>
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
