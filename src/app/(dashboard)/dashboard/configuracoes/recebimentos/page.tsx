import Link from "next/link";
import { ArrowLeft, Landmark, ShieldAlert, Sparkles } from "lucide-react";

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
import { getReceivingSettingsPageData } from "@/modules/wallet/application/wallet-use-cases";
import { WithdrawalSettingsForm } from "@/modules/wallet/presentation/components/withdrawal-settings-form";

export default async function ReceivingSettingsPage() {
  const data = await getReceivingSettingsPageData();

  if (data.state !== "ready") {
    return (
      <div className="velto-page-shell">
        <EmptyState
          description="Não conseguimos localizar sua área comercial agora. Saia da conta e entre novamente para atualizar o acesso."
          icon={ShieldAlert}
          title="Recebimentos indisponíveis"
        />
      </div>
    );
  }

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Button asChild className="mb-5 w-fit" size="sm" variant="outline">
          <Link href="/dashboard/financeiro">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao financeiro
          </Link>
        </Button>

        <Badge
          className="border-accent/25 bg-accent/10 text-accent"
          variant="outline"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Recebimentos
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
          Chave Pix padrão
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Essa chave será usada como padrão nas solicitações de saque. Você
          poderá alterar a chave no momento do saque, se quiser.
        </p>
      </section>

      <Card className="velto-card max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
              <Landmark className="h-4 w-4" />
            </span>
            Dados de recebimento
          </CardTitle>
          <CardDescription>
            Cadastre a chave Pix que deseja usar para receber os saques da sua
            carteira.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawalSettingsForm settings={data.withdrawalSettings} />
        </CardContent>
      </Card>
    </div>
  );
}
