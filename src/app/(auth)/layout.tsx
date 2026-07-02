import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#030806] text-slate-100">
      <div className="grid min-h-dvh lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#030806] text-sidebar-foreground lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(25,205,139,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent)]" />
          <div className="velto-grid absolute inset-0 opacity-[0.12]" />
          <div className="relative flex min-h-dvh flex-col justify-between p-10">
            <div>
              <Button
                asChild
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                variant="ghost"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>

            <div className="max-w-xl">
              <Badge
                className="border-accent/30 bg-accent/10 text-accent"
                variant="outline"
              >
                Supabase Auth
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-normal">
                Acesso seguro para produtores digitais.
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-400">
                Sessão persistente, cookies seguros e fluxos essenciais de
                cadastro, login e recuperação de senha para a base do MVP.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-400">
              {[
                ["Server-first", "Actions e guards no servidor."],
                ["Sessão", "Refresh automático via middleware."],
                ["Segurança", "Sem service role no frontend."],
              ].map(([title, description]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_52px_rgba(0,0,0,0.18)]"
                  key={title}
                >
                  <div className="flex items-center gap-2 font-medium text-white">
                    {title === "Segurança" ? (
                      <ShieldCheck className="h-4 w-4 text-accent" />
                    ) : title === "Sessão" ? (
                      <LockKeyhole className="h-4 w-4 text-accent" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-accent" />
                    )}
                    {title}
                  </div>
                  <p className="mt-1 text-xs">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%),linear-gradient(120deg,transparent,rgba(25,205,139,0.08))]" />
          <div className="relative w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
