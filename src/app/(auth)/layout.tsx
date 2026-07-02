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
    <main className="min-h-dvh bg-background">
      <div className="grid min-h-dvh lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden border-r bg-sidebar text-sidebar-foreground lg:block">
          <div className="velto-grid absolute inset-0 opacity-40" />
          <div className="relative flex min-h-dvh flex-col justify-between p-10">
            <div>
              <Button asChild variant="ghost">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>

            <div className="max-w-xl">
              <Badge className="bg-white/10 text-white" variant="outline">
                Supabase Auth
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-normal">
                Acesso seguro para produtores digitais.
              </h1>
              <p className="text-sidebar-foreground/68 mt-5 text-sm leading-7">
                Sessão persistente, cookies seguros e fluxos essenciais de
                cadastro, login e recuperação de senha para a base do MVP.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-sidebar-foreground/70">
              {[
                ["Server-first", "Actions e guards no servidor."],
                ["Sessão", "Refresh automático via middleware."],
                ["Segurança", "Sem service role no frontend."],
              ].map(([title, description]) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  key={title}
                >
                  <div className="flex items-center gap-2 font-medium text-sidebar-foreground">
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

        <section className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6">
          {children}
        </section>
      </div>
    </main>
  );
}
