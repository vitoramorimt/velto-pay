import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
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

const benefits = [
  {
    description:
      "Crie uma experiência de compra própria para vender produtos digitais com mais controle de marca e jornada.",
    icon: CreditCard,
    title: "Checkout próprio",
  },
  {
    description:
      "Transforme sinais da operação em sugestões práticas para melhorar conversão, oferta e relacionamento.",
    icon: BrainCircuit,
    title: "IA de Vendas",
  },
  {
    description:
      "Organize pedidos, clientes, produtos e financeiro em uma base preparada para crescer com o seu negócio.",
    icon: ShieldCheck,
    title: "Operação financeira",
  },
];

const steps = [
  {
    description:
      "Configure sua oferta, defina os detalhes do produto digital e prepare a experiência de compra.",
    title: "Cadastre seu produto",
  },
  {
    description:
      "Compartilhe o link com sua audiência e conduza o comprador por um fluxo simples, rápido e confiável.",
    title: "Publique seu checkout",
  },
  {
    description:
      "Use a área privada para acompanhar a evolução da operação e encontrar oportunidades de crescimento.",
    title: "Acompanhe e evolua",
  },
];

const aiHighlights = [
  "Resumo inteligente da operação",
  "Sugestões para aumentar conversão",
  "Alertas sobre oportunidades de melhoria",
];

const securityItems = [
  "Autenticação Supabase preparada para sessões seguras",
  "PostgreSQL com políticas de acesso por contexto",
  "Service role restrita a adapters server-only",
  "Base preparada para CSP, HSTS, rate limiting e logs mascarados",
];

const mockupTracks = ["Produto", "Checkout", "Entrega", "IA de Vendas"];

export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#030806] text-slate-100">
      <header className="velto-app-header bg-[#030806]/72 fixed inset-x-0 top-0 z-[70] border-b border-white/10 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 w-full max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link
            aria-label="Velto Pay"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            href="/"
          >
            <VeltoLogo
              imageClassName="rounded-md"
              labelClassName="hidden text-sm text-white sm:inline sm:text-base"
              showLabel
              size={38}
            />
          </Link>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1 text-sm text-slate-400 shadow-[0_18px_70px_rgba(0,0,0,0.18)] lg:flex"
          >
            {[
              ["Produto", "#produto"],
              ["Como funciona", "#como-funciona"],
              ["IA de Vendas", "#ia-de-vendas"],
              ["Segurança", "#seguranca"],
            ].map(([label, href]) => (
              <Link
                className="rounded-full px-4 py-2 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                href={href}
                key={label}
              >
                {label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Acesso" className="flex items-center gap-2">
            <Button
              asChild
              className="text-slate-300 hover:bg-white/10 hover:text-white"
              size="sm"
              variant="ghost"
            >
              <Link href="/login">
                <span className="hidden sm:inline">Acessar minha conta</span>
                <span className="sm:hidden">Entrar</span>
              </Link>
            </Button>
            <Button
              asChild
              className="border border-accent/25 bg-accent text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.24)] hover:bg-accent/90"
              size="sm"
            >
              <Link href="/cadastro">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="velto-public-hero relative isolate overflow-hidden border-b border-white/10">
        <Image
          alt=""
          aria-hidden
          className="absolute inset-0 -z-30 h-full w-full scale-105 object-cover opacity-[0.12]"
          fill
          priority
          sizes="100vw"
          src="/brand/velto-pay-logo.jpeg"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(3,8,6,0.54),#030806_78%),radial-gradient(circle_at_50%_12%,rgba(25,205,139,0.22),transparent_40%),radial-gradient(circle_at_82%_28%,rgba(255,255,255,0.07),transparent_28%),linear-gradient(110deg,rgba(25,205,139,0.13),transparent_42%,rgba(59,130,246,0.06))]" />
        <div className="velto-grid absolute inset-0 -z-10 opacity-[0.10]" />

        <div className="mx-auto grid min-h-[84dvh] w-full max-w-[1520px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-24">
          <div className="velto-fade-up mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <Badge
              className="mb-7 border-accent/30 bg-accent/10 px-3 py-1 text-accent shadow-[0_0_48px_rgba(25,205,139,0.18)]"
              variant="outline"
            >
              Plataforma brasileira para produtos digitais
            </Badge>
            <h1 className="text-balance text-5xl font-semibold leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Venda produtos digitais com checkout próprio, IA de vendas e
              operação financeira em um único lugar.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl lg:mx-0">
              A Velto Pay reúne a estrutura para produtores digitais lançarem,
              venderem e acompanharem sua operação com uma experiência premium,
              segura e preparada para escalar.
            </p>

            <div className="mt-9 flex w-full max-w-md flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row lg:justify-start">
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

            <div className="mt-9 grid gap-3 text-left sm:grid-cols-3">
              {["Checkout próprio", "IA comercial", "Financeiro integrado"].map(
                (item) => (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300 shadow-[0_16px_55px_rgba(0,0,0,0.16)]"
                    key={item}
                  >
                    <CheckCircle2 className="mb-2 h-4 w-4 text-accent" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>

          <PublicPlatformMockup />
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-[1520px] px-4 py-18 sm:px-6 lg:px-10 lg:py-22"
        id="produto"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            className="border-accent/30 bg-accent/10 text-accent"
            variant="outline"
          >
            Benefícios
          </Badge>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Uma base única para vender, entender e evoluir.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            A Velto Pay combina checkout, inteligência comercial e operação em
            uma experiência pensada para produtores digitais modernos.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {benefits.map((item) => (
            <Card
              className="group border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-white/[0.065]"
              key={item.title}
            >
              <CardHeader className="p-6">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent shadow-[0_0_44px_rgba(25,205,139,0.12)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-white">
                  {item.title}
                </CardTitle>
                <CardDescription className="mt-2 leading-6 text-slate-400">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="border-y border-white/10 bg-white/[0.025]"
        id="como-funciona"
      >
        <div className="mx-auto grid w-full max-w-[1520px] gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:py-22">
          <div className="max-w-xl">
            <Badge
              className="border-accent/30 bg-accent/10 text-accent"
              variant="outline"
            >
              Como funciona
            </Badge>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Do produto publicado à operação organizada.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              A jornada pública apresenta a proposta da Velto Pay. A área
              privada fica reservada para produtores acompanharem a operação com
              segurança após o login.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div
                className="rounded-lg border border-white/10 bg-[#050c09]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-colors duration-300 hover:border-accent/25 hover:bg-white/[0.045]"
                key={step.title}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-sm font-semibold text-accent">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-[1520px] gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-10 lg:py-22"
        id="ia-de-vendas"
      >
        <div className="rounded-lg border border-accent/20 bg-[linear-gradient(145deg,rgba(25,205,139,0.11),rgba(255,255,255,0.04)_42%,rgba(5,12,9,0.92))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-accent/25 bg-accent/10 text-accent shadow-[0_0_54px_rgba(25,205,139,0.15)]">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="mt-7 text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            IA de Vendas para encontrar oportunidades antes que elas passem.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
            A visão de IA da Velto Pay nasce para apoiar decisões comerciais,
            explicar sinais importantes e sugerir próximos passos para melhorar
            sua operação digital.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {aiHighlights.map((item) => (
              <div
                className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300"
                key={item}
              >
                <Sparkles className="mb-3 h-4 w-4 text-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <FeaturePanel
            description="Venda com uma experiência de checkout alinhada à sua marca e preparada para conversão."
            icon={PackageOpen}
            title="Produtos digitais"
          />
          <FeaturePanel
            description="Tenha uma base consistente para pedidos, clientes e eventos financeiros ao longo do crescimento."
            icon={CreditCard}
            title="Operação centralizada"
          />
          <FeaturePanel
            description="Use inteligência aplicada à venda para transformar dados em decisões mais claras."
            icon={BrainCircuit}
            title="Decisão assistida"
          />
        </div>
      </section>

      <section
        className="border-y border-white/10 bg-white/[0.025]"
        id="seguranca"
      >
        <div className="mx-auto grid w-full max-w-[1520px] gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-22">
          <div>
            <Badge
              className="border-accent/30 bg-accent/10 text-accent"
              variant="outline"
            >
              Segurança
            </Badge>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Infraestrutura pensada para proteger dados e operação.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              A plataforma segue uma arquitetura server-first, com separação de
              responsabilidades e controles de acesso preparados para produção.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {securityItems.map((item) => (
              <div
                className="flex gap-3 rounded-lg border border-white/10 bg-[#050c09]/80 p-4 text-sm leading-6 text-slate-300 shadow-[0_18px_60px_rgba(0,0,0,0.16)]"
                key={item}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1520px] px-4 py-18 sm:px-6 lg:px-10 lg:py-22">
        <div className="overflow-hidden rounded-lg border border-accent/20 bg-[linear-gradient(135deg,rgba(25,205,139,0.14),rgba(255,255,255,0.05)_44%,rgba(3,8,6,0.92))] p-8 text-center shadow-[0_32px_110px_rgba(0,0,0,0.30)] sm:p-12">
          <VeltoLogo
            className="justify-center"
            imageClassName="rounded-md"
            labelClassName="text-lg text-white"
            showLabel
            size={44}
          />
          <h2 className="mx-auto mt-7 max-w-3xl text-balance text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Pronto para vender produtos digitais com mais controle?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Comece pela Velto Pay e construa uma operação com checkout,
            inteligência e financeiro em uma única plataforma.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 border border-accent/25 bg-accent px-6 text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.24)] hover:bg-accent/90"
              size="lg"
            >
              <Link href="/cadastro">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="h-11 border-white/10 bg-white/[0.035] px-6 text-white hover:bg-white/[0.07]"
              size="lg"
              variant="outline"
            >
              <Link href="/login">Acessar minha conta</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <VeltoLogo
            imageClassName="rounded-md"
            labelClassName="text-sm text-white"
            showLabel
            size={30}
          />
          <p>© 2026 Velto Pay. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}

function PublicPlatformMockup() {
  return (
    <div
      aria-label="Mockup visual da plataforma Velto Pay"
      className="relative mx-auto w-full max-w-3xl rounded-lg border border-white/10 bg-[rgba(6,16,12,0.92)] p-3 shadow-[0_34px_120px_rgba(0,0,0,0.46)] backdrop-blur-xl"
    >
      <div className="absolute -inset-px -z-10 rounded-lg bg-[linear-gradient(135deg,rgba(25,205,139,0.36),transparent_32%,rgba(255,255,255,0.10)_64%,transparent)] opacity-70" />
      <div className="rounded-md border border-white/10 bg-[#08120e]/95 p-4">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10">
              <VeltoLogo imageClassName="rounded-sm" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Velto Pay</p>
              <p className="text-xs text-slate-500">
                Prévia visual da plataforma
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Checkout", "IA de Vendas", "Financeiro"].map((item) => (
              <span
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 pt-4 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-lg border border-white/10 bg-black/20 p-3">
            {[
              "Produtos digitais",
              "Checkout próprio",
              "IA de Vendas",
              "Segurança",
            ].map((item, index) => (
              <div
                className="flex items-center gap-3 rounded-md px-3 py-2 text-xs text-slate-400"
                key={item}
              >
                <span
                  className={
                    index === 0
                      ? "h-2 w-2 rounded-full bg-accent shadow-[0_0_18px_rgba(25,205,139,0.8)]"
                      : "h-2 w-2 rounded-full bg-white/20"
                  }
                />
                {item}
              </div>
            ))}
          </aside>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Painel do produtor
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Mockup sem dados operacionais
                  </p>
                </div>
                <span className="w-fit rounded-md border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                  Pronto para vender
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Oferta", "Checkout", "Entrega"].map((item) => (
                  <div
                    className="rounded-md border border-white/10 bg-black/20 p-3"
                    key={item}
                  >
                    <p className="text-xs font-medium text-slate-300">{item}</p>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-full w-2/3 rounded-full bg-accent/55" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="text-sm font-medium text-white">Fluxo de venda</p>
                <div className="mt-4 grid gap-3">
                  {mockupTracks.map((item) => (
                    <div className="flex items-center gap-3" key={item}>
                      <div className="h-2.5 w-2.5 rounded-full bg-accent/80" />
                      <div className="h-2 flex-1 rounded-full bg-white/10">
                        <div className="h-full w-3/4 rounded-full bg-white/25" />
                      </div>
                      <span className="w-24 text-xs text-slate-500">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <p className="text-sm font-medium text-white">
                  Inteligência comercial
                </p>
                <div className="mt-4 space-y-2">
                  {["Oferta clara", "Checkout direto", "Decisão assistida"].map(
                    (item) => (
                      <div
                        className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400"
                        key={item}
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type FeaturePanelProps = {
  description: string;
  icon: LucideIcon;
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
