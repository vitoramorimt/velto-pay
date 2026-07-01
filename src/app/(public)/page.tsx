import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  Layers3,
  PackageOpen,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const colorTokens = [
  { name: "Primary", className: "bg-primary", text: "text-primary" },
  { name: "Accent", className: "bg-accent", text: "text-accent" },
  { name: "Success", className: "bg-success", text: "text-success" },
  { name: "Warning", className: "bg-warning", text: "text-warning" },
  {
    name: "Destructive",
    className: "bg-destructive",
    text: "text-destructive",
  },
  { name: "Muted", className: "bg-muted", text: "text-muted-foreground" },
];

const tableRows = [
  ["Checkout PIX", "Ativo", "R$ 12.490,00", "98.2%"],
  ["Cartao premium", "Preview", "R$ 8.120,00", "94.6%"],
  ["KYC manual", "Fila", "24 itens", "72.0%"],
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="flex min-h-dvh">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <AppHeader />

          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            <section className="velto-surface velto-grid overflow-hidden rounded-lg p-6 sm:p-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <Badge variant="outline">Design System</Badge>
                  <h1 className="mt-5 text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
                    Uma interface premium, precisa e pronta para escalar.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                    Tokens, componentes e padroes visuais da Velto Pay para
                    criar produtos digitais com consistencia, velocidade e
                    confianca operacional.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Button asChild variant="premium">
                    <Link href="/cadastro">
                      Comecar cadastro
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/login">Entrar</Link>
                  </Button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                ["Superficie", "Cards, modais e paineis usam bordas sutis."],
                [
                  "Contraste",
                  "Tema claro e escuro com hierarquia consistente.",
                ],
                ["Ritmo", "Espacamentos previsiveis para fluxos densos."],
              ].map(([title, description], index) => (
                <Card key={title}>
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {index === 0 ? (
                        <Layers3 className="h-5 w-5" />
                      ) : index === 1 ? (
                        <Sparkles className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Sistema de cores</CardTitle>
                  <CardDescription>
                    Tokens semanticos para estados, acao primaria e superficies.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {colorTokens.map((token) => (
                    <div
                      className="rounded-lg border bg-background/70 p-3"
                      key={token.name}
                    >
                      <div
                        className={`h-16 rounded-md shadow-inner-line ${token.className}`}
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {token.name}
                        </span>
                        <span className={`text-xs ${token.text}`}>token</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipografia e ritmo</CardTitle>
                  <CardDescription>
                    Escala limpa para leitura rapida em operacoes recorrentes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Display
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-normal">
                      Receita sem friccao
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Body
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Textos de suporte usam contraste controlado e altura de
                      linha confortavel para leitura em paineis densos.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
                    {[4, 8, 12, 16].map((size) => (
                      <div
                        className="rounded-md border bg-background p-2"
                        key={size}
                      >
                        {size}px
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Controles</CardTitle>
                  <CardDescription>
                    Componentes shadcn/ui com acabamento Velto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button">Primario</Button>
                    <Button type="button" variant="premium">
                      Premium
                    </Button>
                    <Button type="button" variant="outline">
                      Outline
                    </Button>
                    <Button type="button" variant="subtle">
                      Subtle
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Nome do produto</Label>
                      <Input id="product-name" placeholder="Curso premium" />
                    </div>
                    <div className="space-y-2">
                      <Label>Metodo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar metodo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="card">Cartao</SelectItem>
                          <SelectItem value="both">PIX e cartao</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="success">Aprovado</Badge>
                    <Badge variant="warning">Pendente</Badge>
                    <Badge variant="destructive">Falhou</Badge>
                    <Badge variant="muted">Rascunho</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modal, loading e empty</CardTitle>
                  <CardDescription>
                    Estados visuais para fluxos ainda sem dados reais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">
                        Abrir modal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modal Velto</DialogTitle>
                        <DialogDescription>
                          Padrao visual para confirmacoes, formularios curtos e
                          revisoes operacionais.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                        Nenhuma acao de negocio e executada neste componente.
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                        <Button type="button">Confirmar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <LoadingState label="Preparando componentes visuais" />
                  <EmptyState
                    actionLabel="Criar visual"
                    description="Use este estado quando uma lista ainda nao possuir conteudo."
                    icon={PackageOpen}
                    title="Nenhum item visual"
                  />
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Skeletons</CardTitle>
                  <CardDescription>
                    Blocos de carregamento para preservar layout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-28 w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tabela</CardTitle>
                  <CardDescription>
                    Visual para listas densas, ainda sem integracao de dados.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modulo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead className="text-right">Saude</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableRows.map(([module, status, volume, health]) => (
                        <TableRow key={module}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {module === "Checkout PIX" ? (
                                <CreditCard className="h-4 w-4 text-primary" />
                              ) : module === "Cartao premium" ? (
                                <WalletCards className="h-4 w-4 text-accent" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                              {module}
                            </div>
                          </TableCell>
                          <TableCell>{status}</TableCell>
                          <TableCell>{volume}</TableCell>
                          <TableCell className="text-right">{health}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
