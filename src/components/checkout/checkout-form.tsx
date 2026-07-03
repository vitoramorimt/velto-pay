"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Package, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  BoletoPaymentDetails,
  PaymentMethod,
  PixPaymentDetails,
} from "@/domain/entities/payment";
import { formatCents } from "@/lib/format-money";
import {
  customerFormSchema,
  type BoletoFormValues,
  type CardFormValues,
  type CustomerFormValues,
} from "@/lib/validators";

import { CustomerDataForm } from "./customer-data-form";
import { ErrorView, PendingView, SuccessView } from "./success-view";
import { PaymentMethodTabs } from "./payment-method-tabs";
import type { CheckoutSessionView } from "./types";

interface CheckoutFormProps {
  session: CheckoutSessionView;
}

type FlowState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "pix_pending"; details: PixPaymentDetails }
  | { kind: "boleto_pending"; details: BoletoPaymentDetails }
  | { kind: "approved" }
  | { kind: "error"; message: string };

async function confirmPayment(sessionId: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/checkout-sessions/${sessionId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível processar o pagamento");
  }
  return payload;
}

export function CheckoutForm({ session }: CheckoutFormProps) {
  const [flow, setFlow] = useState<FlowState>({ kind: "idle" });
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });

  const ensureCustomerValid = async () => {
    const isValid = await customerForm.trigger();
    return isValid ? customerForm.getValues() : null;
  };

  const handleCardSubmit = async (
    method: Extract<PaymentMethod, "credit_card" | "debit_card">,
    values: CardFormValues,
  ) => {
    const customer = await ensureCustomerValid();
    if (!customer) return;

    setFlow({ kind: "submitting" });
    try {
      const [expiryMonth, expiryYear] = values.expiry.split("/");
      const result = await confirmPayment(session.id, {
        method,
        customer,
        card: {
          holderName: values.holderName,
          number: values.number,
          expiryMonth,
          expiryYear,
          cvv: values.cvv,
          installments: values.installments,
        },
      });
      if (result.status === "approved") {
        setFlow({ kind: "approved" });
      } else {
        setFlow({
          kind: "error",
          message: "Pagamento recusado. Verifique os dados do cartão e tente novamente.",
        });
      }
    } catch (error) {
      setFlow({
        kind: "error",
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  };

  const handleGeneratePix = async () => {
    const customer = await ensureCustomerValid();
    if (!customer) return;

    setFlow({ kind: "submitting" });
    try {
      const result = await confirmPayment(session.id, { method: "pix", customer });
      setFlow({ kind: "pix_pending", details: result.pixDetails });
    } catch (error) {
      setFlow({
        kind: "error",
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  };

  const handleBoletoSubmit = async (values: BoletoFormValues) => {
    const customer = await ensureCustomerValid();
    if (!customer) return;

    setFlow({ kind: "submitting" });
    try {
      const result = await confirmPayment(session.id, {
        method: "boleto",
        customer,
        payerDocument: values.payerDocument,
      });
      setFlow({ kind: "boleto_pending", details: result.boletoDetails });
    } catch (error) {
      setFlow({
        kind: "error",
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  };

  if (flow.kind === "approved") {
    return (
      <Card className="w-full border-border/60 shadow-xl shadow-black/30">
        <CardContent className="pt-6">
          <SuccessView
            message={`Recebemos o pagamento de ${formatCents(session.totalAmountCents)}.`}
            successUrl={session.successUrl}
          />
        </CardContent>
      </Card>
    );
  }

  const submitting = flow.kind === "submitting";
  const pixDetails = flow.kind === "pix_pending" ? flow.details : null;
  const boletoDetails = flow.kind === "boleto_pending" ? flow.details : null;

  return (
    <Card className="w-full border-border/60 shadow-xl shadow-black/30">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-center gap-3">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Package className="size-7 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{session.items[0]?.name}</p>
            <p className="text-sm font-semibold text-brand-green">
              {formatCents(session.totalAmountCents)}{" "}
              <span className="text-xs font-normal text-muted-foreground">à vista</span>
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <User className="size-4 text-muted-foreground" />
            Seus dados
          </p>
          <CustomerDataForm form={customerForm} />
        </div>

        <Separator />

        <div>
          <p className="text-sm font-semibold">Forma de pagamento</p>
          <p className="text-xs text-muted-foreground">
            Escolha como deseja pagar e preencha os dados abaixo.
          </p>
        </div>

        {flow.kind === "error" ? <ErrorView message={flow.message} /> : null}

        {flow.kind === "pix_pending" ? (
          <PendingView
            title="Aguardando pagamento"
            message="Assim que o PIX for confirmado, você verá a atualização aqui."
          />
        ) : null}

        <PaymentMethodTabs
          allowedMethods={session.allowedPaymentMethods}
          submitting={submitting}
          pixDetails={pixDetails}
          boletoDetails={boletoDetails}
          items={session.items}
          totalAmountCents={session.totalAmountCents}
          onSubmitCard={handleCardSubmit}
          onGeneratePix={handleGeneratePix}
          onSubmitBoleto={handleBoletoSubmit}
        />
      </CardContent>
    </Card>
  );
}
