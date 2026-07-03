import { AlertTriangle, ShieldCheck } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummarySidebar } from "@/components/checkout/order-summary-sidebar";
import { toCheckoutSessionView } from "@/components/checkout/types";
import { VeltoPayLogo } from "@/components/checkout/velto-pay-logo";
import { Card, CardContent } from "@/components/ui/card";
import { isCheckoutSessionExpired } from "@/domain/entities/checkout-session";
import { GetCheckoutSessionUseCase } from "@/application/use-cases/get-checkout-session";
import { getCheckoutSessionRepository } from "@/infrastructure/container";

interface CheckoutPageProps {
  params: Promise<{ sessionId: string }>;
}

function StatusCard({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle className="size-10 text-amber-500" />
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { sessionId } = await params;

  const repository = await getCheckoutSessionRepository();
  const useCase = new GetCheckoutSessionUseCase(repository);
  const session = await useCase.execute(sessionId);

  const isPayable =
    session &&
    session.status !== "paid" &&
    session.status !== "canceled" &&
    !isCheckoutSessionExpired(session);

  return (
    <main className="dark relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--brand-green-soft),transparent)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6 pb-6">
        <VeltoPayLogo />
      </div>

      {!isPayable ? (
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-6">
          {!session ? (
            <StatusCard
              title="Checkout não encontrado"
              message="O link que você acessou é inválido ou já não existe mais."
            />
          ) : session.status === "paid" ? (
            <StatusCard
              title="Pedido já pago"
              message="Este checkout já foi concluído anteriormente."
            />
          ) : session.status === "canceled" ? (
            <StatusCard
              title="Checkout cancelado"
              message="Este link de pagamento foi cancelado pelo lojista."
            />
          ) : (
            <StatusCard
              title="Checkout expirado"
              message="O prazo para pagamento deste pedido expirou. Solicite um novo link."
            />
          )}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-brand-green" />
            Pagamento processado com segurança pela VeltoPay
          </p>
        </div>
      ) : (
        <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <CheckoutForm session={toCheckoutSessionView(session)} />

          <div className="flex flex-col gap-6">
            <OrderSummarySidebar
              merchantName={session.merchantName}
              items={session.items.map((item) => ({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unitAmountCents: item.unitAmount.cents,
              }))}
              totalAmountCents={session.totalAmount.cents}
            />
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-brand-green" />
              Pagamento processado com segurança pela VeltoPay
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
