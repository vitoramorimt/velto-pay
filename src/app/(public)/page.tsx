import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const platformHighlights = [
  {
    description:
      "Estrutura preparada para checkout, pedidos, pagamentos e conciliação financeira.",
    icon: CreditCard,
    title: "Venda digital",
  },
  {
    description:
      "Base Supabase versionada com RLS, onboarding de produtores e auditoria evolutiva.",
    icon: ShieldCheck,
    title: "Operação segura",
  },
  {
    description:
      "Interface premium para produtores acompanharem a operação sem ruído.",
    icon: BarChart3,
    title: "Crescimento claro",
  },
];

const trustItems = [
  "Onboarding com produtor vinculado automaticamente",
  "Rotas privadas protegidas por sessão Supabase",
  "Arquitetura pronta para evoluir o MVP com segurança",
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link aria-label="Velto Pay" href="/">
            <VeltoLogo
              imageClassName="rounded-md"
              labelClassName="text-sm sm:text-base"
              showLabel
              size={34}
            />
          </Link>

          <nav aria-label="Acesso" className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/cadastro">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-border/70 pt-16">
        <Image
          alt=""
          aria-hidden
          className="dark:opacity-24 absolute inset-0 -z-20 h-full w-full object-cover opacity-20"
          fill
          priority
          sizes="100vw"
          src="/brand/velto-pay-logo.jpeg"
        />
        <div className="dark:bg-background/88 absolute inset-0 -z-10 bg-background/90" />

        <div className="mx-auto flex min-h-[82dvh] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-6" variant="outline">
              Plataforma brasileira para produtos digitais
            </Badge>
            <h1 className="text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
              Velto Pay
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              A base premium para produtores digitais venderem com checkout,
              pagamentos e operação financeira em um único ambiente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/cadastro">
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Acessar minha conta</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid max-w-3xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {trustItems.map((item) => (
              <div
                className="flex items-start gap-2 rounded-md border border-border/70 bg-background/70 p-3 backdrop-blur"
                key={item}
              >
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {platformHighlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="border-y border-border/70 bg-card/60">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <Badge variant="outline">Base premium</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal">
              Entrada pública, área privada e onboarding consistente.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Visitantes conhecem a Velto Pay sem barreiras. Produtores entram
              em uma área protegida, com perfil financeiro preparado desde o
              primeiro acesso.
            </p>
          </div>

          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-md border bg-background/70 p-4">
                <LockKeyhole className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium">Área protegida</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Acesso privado com sessão validada antes de abrir dados
                  operacionais.
                </p>
              </div>
              <div className="rounded-md border bg-background/70 p-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-medium">Perfil de produtor</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Contas novas e antigas mantêm o vínculo necessário para
                  acessar produtos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
