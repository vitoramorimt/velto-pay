import {
  Activity,
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
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { LogoutButton } from "@/modules/auth/presentation/components/logout-button";

const metricCards = [
  {
    description: "+18,4% vs. periodo anterior",
    icon: CircleDollarSign,
    label: "Receita total",
    tone: "text-success",
    value: "R$ 48.920,40",
  },
  {
    description: "Pedidos confirmados no periodo",
    icon: ShoppingCart,
    label: "Vendas aprovadas",
    tone: "text-primary",
    value: "328",
  },
  {
    description: "Aguardando confirmacao operacional",
    icon: Clock3,
    label: "Vendas pendentes",
    tone: "text-warning",
    value: "24",
  },
  {
    description: "Visitantes que chegaram ao pedido",
    icon: Activity,
    label: "Conversao",
    tone: "text-accent",
    value: "7,8%",
  },
  {
    description: "Produtos publicados para venda",
    icon: PackageCheck,
    label: "Produtos ativos",
    tone: "text-success",
    value: "12",
  },
  {
    description: "Clientes unicos no periodo",
    icon: Users,
    label: "Clientes",
    tone: "text-primary",
    value: "1.248",
  },
];

const chartData = [
  { day: "Seg", value: 42 },
  { day: "Ter", value: 58 },
  { day: "Qua", value: 46 },
  { day: "Qui", value: 71 },
  { day: "Sex", value: 88 },
  { day: "Sab", value: 64 },
  { day: "Dom", value: 79 },
];

const latestSales = [
  {
    amount: "R$ 497,00",
    customer: "Mariana Costa",
    product: "Mentoria Velto Start",
    status: "Aprovada",
    time: "ha 12 min",
  },
  {
    amount: "R$ 197,00",
    customer: "Bruno Martins",
    product: "Curso Checkout Pro",
    status: "Pendente",
    time: "ha 28 min",
  },
  {
    amount: "R$ 897,00",
    customer: "Ana Ribeiro",
    product: "Programa Growth Digital",
    status: "Aprovada",
    time: "ha 54 min",
  },
  {
    amount: "R$ 97,00",
    customer: "Felipe Rocha",
    product: "Template de Lancamento",
    status: "Aprovada",
    time: "ha 1h",
  },
];

function getStatusVariant(status: string) {
  return status === "Aprovada" ? "success" : "warning";
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const hasDashboardData =
    metricCards.length > 0 || chartData.length > 0 || latestSales.length > 0;

  if (!hasDashboardData) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="velto-surface rounded-lg p-6 sm:p-8">
          <Badge variant="outline">Dashboard</Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-3xl">
            Bem-vindo a Velto Pay
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Assim que houver movimentacao, suas metricas principais vao aparecer
            aqui.
          </p>
        </section>

        <EmptyState
          description="Cadastre produtos e publique seus checkouts nas proximas fases para acompanhar vendas, clientes e conversao."
          icon={Sparkles}
          title="Nenhum dado para exibir"
        />
      </div>
    );
  }

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
              Visao executiva mockada para acompanhar receita, vendas,
              conversao e atividade recente da operacao Velto Pay.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
            <div className="rounded-md border bg-background/70 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Conta</p>
              <p className="mt-1 max-w-56 truncate font-medium">
                {user.email ?? "Usuario Velto"}
              </p>
            </div>
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
                Grafico simples com dados mockados da semana.
              </CardDescription>
            </div>
            <Badge variant="outline">Ultimos 7 dias</Badge>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="flex min-h-72 flex-col justify-end gap-5">
                <div className="flex h-56 items-end gap-3 rounded-lg border bg-background/70 px-4 py-5 sm:gap-4">
                  {chartData.map((item) => (
                    <div
                      className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3"
                      key={item.day}
                    >
                      <div className="flex flex-1 items-end">
                        <div
                          aria-label={`${item.day}: ${item.value}%`}
                          className="w-full rounded-t-md bg-primary/85 shadow-sm shadow-primary/20 transition-colors hover:bg-primary"
                          style={{ height: `${item.value}%` }}
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
                      Sexta-feira
                    </p>
                  </div>
                  <div className="rounded-md border bg-background/70 p-3">
                    <p className="text-xs uppercase">Ticket medio</p>
                    <p className="mt-1 font-medium text-foreground">
                      R$ 314,20
                    </p>
                  </div>
                  <div className="rounded-md border bg-background/70 p-3">
                    <p className="text-xs uppercase">Tendencia</p>
                    <p className="mt-1 flex items-center gap-1 font-medium text-success">
                      <ArrowUpRight className="h-4 w-4" />
                      Alta estavel
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
                Lista mockada para validar hierarquia e densidade visual.
              </CardDescription>
            </div>
            <Button size="sm" type="button" variant="outline">
              Ver todas
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {latestSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestSales.map((sale) => (
                    <TableRow key={`${sale.customer}-${sale.time}`}>
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
                              {sale.product} - {sale.time}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sale.status)}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {sale.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                description="As vendas mais recentes vao aparecer aqui assim que houver pedidos aprovados ou pendentes."
                icon={ReceiptText}
                title="Nenhuma venda recente"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
