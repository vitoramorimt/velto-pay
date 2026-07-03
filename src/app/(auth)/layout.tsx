import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

const authHighlights = [
  "Checkout próprio para produtos digitais",
  "IA de Vendas para orientar decisões",
  "Operação financeira em uma única plataforma",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#030806] text-slate-100">
      <div className="velto-grid pointer-events-none fixed inset-0 opacity-[0.08]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(25,205,139,0.18),transparent_30rem),radial-gradient(circle_at_84%_0%,rgba(59,130,246,0.10),transparent_28rem),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_36%)]" />

      <div className="relative grid min-h-dvh lg:grid-cols-[1.02fr_0.98fr]">
        <section className="hidden min-h-dvh flex-col justify-between border-r border-white/10 px-10 py-8 lg:flex">
          <div className="flex items-center justify-between gap-4">
            <Link
              aria-label="Velto Pay"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              href="/"
            >
              <VeltoLogo
                imageClassName="h-10 w-10 rounded-md"
                labelClassName="text-sm text-white"
                priority
                showLabel
                size={40}
              />
            </Link>

            <Button
              asChild
              className="border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white"
              size="sm"
              variant="outline"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <ThemeToggle className="border-white/10 bg-white/[0.04]" />
          </div>

          <div className="max-w-xl">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-accent/25 bg-accent/10 text-accent shadow-[0_0_54px_rgba(25,205,139,0.16)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-normal text-white">
              Acesse sua operação digital com clareza.
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Entre ou crie sua conta para organizar produtos, acompanhar a
              operação e preparar a próxima etapa de vendas da Velto Pay.
            </p>

            <div className="mt-8 grid gap-3">
              {authHighlights.map((item) => (
                <div
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
                  key={item}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Escolha dark ou light no navegador. A área segura mantém a
            identidade premium da Velto Pay.
          </p>
        </section>

        <section className="relative flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute inset-x-4 top-4 flex items-center justify-between lg:hidden">
            <Link
              aria-label="Velto Pay"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              href="/"
            >
              <VeltoLogo
                imageClassName="h-9 w-9 rounded-md"
                labelClassName="text-sm text-white"
                showLabel
                size={36}
              />
            </Link>
            <Button
              asChild
              className="border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white"
              size="sm"
              variant="outline"
            >
              <Link href="/">Voltar</Link>
            </Button>
          </div>

          <div className="w-full max-w-[27rem] pt-20 lg:pt-0">{children}</div>
        </section>
      </div>
    </main>
  );
}
