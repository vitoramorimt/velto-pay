import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { LogoutButton } from "@/modules/auth/presentation/components/logout-button";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="velto-surface rounded-lg p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="success">Sessao ativa</Badge>
            <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-3xl">
              Area privada protegida
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Esta tela confirma o fluxo de autenticacao e o layout privado.
              Nenhuma funcionalidade de dashboard, produto ou pagamento foi
              implementada nesta sprint.
            </p>
          </div>
          <LogoutButton />
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle>Identidade autenticada</CardTitle>
          <CardDescription>
            Dados obtidos da sessao Supabase validada no servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-md border bg-background/70 p-3">
            <p className="text-xs uppercase text-muted-foreground">E-mail</p>
            <p className="mt-1 font-medium">{user.email ?? "Sem e-mail"}</p>
          </div>
          <div className="rounded-md border bg-background/70 p-3">
            <p className="text-xs uppercase text-muted-foreground">Role</p>
            <p className="mt-1 font-medium">{user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
