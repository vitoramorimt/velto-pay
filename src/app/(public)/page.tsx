import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const platformHighlights = [
  {
    description:
      "Checkout, pedidos, pagamentos e conciliação financeira preparados para evoluir com o MVP.",
    icon: CreditCard,
    title: "Venda digital",
  },
  {
    description:
      "Base Supabase versionada com RLS, onboarding de produtores e trilha de auditoria evolutiva.",
    icon: ShieldCheck,
    title: "Operação segura",
  },
  {
    description:
      "Visão executiva para acompanhar receita, produtos e atividade sem ruído operacional.",
    icon: BarChart3,
    title: "Crescimento claro",
  },
];

const trustItems = [
  "Produtor vinculado automaticamente",
  "Rotas privadas com sessão Supabase",
  "Arquitetura pronta para escalar",
];

const operatingSignals = [
  ["Receita", "R$ 0,00"],
  ["Aprovação", "0%"],
  ["Produtos ativos", "0"],
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#030806] text-slate-100">
      <header className="bg-[#030806]/78 fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 w-full max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link
            aria-label="Velto Pay"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            href="/"
          >
            <VeltoLogo
              imageClassName="rounded-md"
              labelClassName="text-sm text-white sm:text-base"
              showLabel
              size={38}
            />
          </Link>

          <nav aria-label="Acesso" className="flex items-center gap-2">
            <Button
              asChild
              className="text-slate-300 hover:bg-white/10 hover:text-white"
              size="sm"
              variant="ghost"
            >
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              asChild
              className="border border-accent/25 bg-accent text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.24)] hover:bg-accent/90"
              size="sm"
            >
              <Link href="/cadastro">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/10 pt-18">
        <Image
          alt=""
          aria-hidden
          className="absolute inset-0 -z-30 h-full w-full scale-105 object-cover opacity-[0.13]"
          fill
          priority
          sizes="100vw"
          src="/brand/velto-pay-logo.jpeg"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(3,8,6,0.62),#030806_76%),linear-gradient(110deg,rgba(25,205,139,0.16),transparent_42%,rgba(59,130,246,0.08))]" />
        <div className="velto-grid absolute inset-0 -z-10 opacity-[0.11]" />

        <div className="mx-auto flex min-h-[78dvh] w-full max-w-[1520px] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-10">
          <Badge
            className="mb-7 border-accent/30 bg-accent/10 px-3 py-1 text-accent shadow-[0_0_48px_rgba(25,205,139,0.18)]"
            variant="outline"
          >
            Plataforma brasileira para produtos digitais
          </Badge>
          <h1 className="max-w-5xl text-balance text-6xl font-semibold tracking-normal text-white sm:text-7xl lg:text-8xl">
            Velto Pay
          </h1>
          <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl">
            A base premium para produtores digitais venderem com checkout,
            pagamentos e operação financeira em um único ambiente.
          </p>

          <div className="mt-9 flex w-full max-w-md flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Button
              asChild
              className="h-11 border border-accent/25 bg-accent px-6 text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.26)] hover:bg-accent/90"
              size="lg"
            >
              <Link href="/cadastro">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="h-11 border-white/10 bg-white/[0.035] px-6 text-white shadow-[0_18px_52px_rgba(0,0,0,0.22)] hover:bg-white/[0.07]"
              size="lg"
              variant="outline"
            >
              <Link href="/login">Acessar minha conta</Link>
            </Button>
          </div>

          <div className="mt-12 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-slate-300 shadow-[0_18px_52px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-colors hover:border-accent/25 hover:bg-white/[0.06]"
                key={item}
              >
                <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[1520px] gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-10">
          {operatingSignals.map(([label, value]) => (
            <div
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
              key={label}
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1520px] gap-5 px-4 py-18 sm:px-6 md:grid-cols-3 lg:px-10 lg:py-22">
        {platformHighlights.map((item) => (
          <Card
            className="group border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-white/[0.065]"
            key={item.title}
          >
            <CardHeader className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent shadow-[0_0_44px_rgba(25,205,139,0.12)]">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg text-white">{item.title}</CardTitle>
              <CardDescription className="mt-2 leading-6 text-slate-400">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid w-full max-w-[1520px] gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-22">
          <div className="max-w-xl">
            <Badge
              className="border-accent/30 bg-accent/10 text-accent"
              variant="outline"
            >
              Base premium
            </Badge>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Entrada pública, área privada e onboarding consistente.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Visitantes conhecem a Velto Pay sem barreiras. Produtores entram
              em uma área protegida, com perfil financeiro preparado desde o
              primeiro acesso.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeaturePanel
              description="Acesso privado com sessão validada antes de abrir dados operacionais."
              icon={LockKeyhole}
              title="Área protegida"
            />
            <FeaturePanel
              description="Contas novas e antigas mantêm o vínculo necessário para acessar produtos."
              icon={Sparkles}
              title="Perfil de produtor"
            />
            <FeaturePanel
              description="Arquitetura preparada para módulos de vendas, checkout e financeiro."
              icon={Layers3}
              title="MVP escalável"
            />
            <FeaturePanel
              description="Design system consistente entre landing, login, cadastro e dashboard."
              icon={ShieldCheck}
              title="Experiência unificada"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

type FeaturePanelProps = {
  description: string;
  icon: typeof LockKeyhole;
  title: string;
};

function FeaturePanel({ description, icon: Icon, title }: FeaturePanelProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#050c09]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-colors duration-300 hover:border-accent/25 hover:bg-white/[0.045]">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
