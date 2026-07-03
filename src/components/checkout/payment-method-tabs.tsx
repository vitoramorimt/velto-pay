"use client";

import { CheckCircle2, CreditCard, FileText, QrCode, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BoletoPaymentDetails,
  PaymentMethod,
  PixPaymentDetails,
} from "@/domain/entities/payment";
import type { BoletoFormValues, CardFormValues } from "@/lib/validators";

import { BoletoPanel } from "./boleto-panel";
import { CardForm } from "./card-form";
import { PixPanel } from "./pix-panel";

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: typeof CreditCard }> = {
  credit_card: { label: "Crédito", icon: CreditCard },
  debit_card: { label: "Débito", icon: Wallet },
  pix: { label: "PIX", icon: QrCode },
  boleto: { label: "Boleto", icon: FileText },
};

interface PaymentMethodTabsProps {
  allowedMethods: PaymentMethod[];
  submitting: boolean;
  pixDetails: PixPaymentDetails | null;
  boletoDetails: BoletoPaymentDetails | null;
  onSubmitCard: (method: "credit_card" | "debit_card", values: CardFormValues) => void;
  onGeneratePix: () => void;
  onSubmitBoleto: (values: BoletoFormValues) => void;
}

export function PaymentMethodTabs({
  allowedMethods,
  submitting,
  pixDetails,
  boletoDetails,
  onSubmitCard,
  onGeneratePix,
  onSubmitBoleto,
}: PaymentMethodTabsProps) {
  const orderedMethods = useMemo(
    () =>
      [...allowedMethods].sort((a, b) => {
        if (a === "pix") return -1;
        if (b === "pix") return 1;
        return 0;
      }),
    [allowedMethods],
  );
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>(orderedMethods[0]);

  return (
    <Tabs
      value={activeMethod}
      onValueChange={(value) => setActiveMethod(value as PaymentMethod)}
    >
      <TabsList
        className={`grid w-full gap-2 bg-transparent p-0 group-data-horizontal/tabs:h-auto`}
        style={{ gridTemplateColumns: `repeat(${orderedMethods.length}, minmax(0, 1fr))` }}
      >
        {orderedMethods.map((method) => {
          const { label, icon: Icon } = METHOD_CONFIG[method];
          return (
            <TabsTrigger
              key={method}
              value={method}
              className="h-auto flex-col gap-1.5 rounded-lg border border-border bg-transparent py-3 text-muted-foreground after:hidden data-active:border-brand-green data-active:bg-brand-green-soft data-active:text-brand-green"
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {allowedMethods.includes("credit_card") ? (
        <TabsContent value="credit_card" className="pt-6">
          <CardForm
            method="credit_card"
            submitting={submitting}
            onSubmit={(values) => onSubmitCard("credit_card", values)}
          />
        </TabsContent>
      ) : null}

      {allowedMethods.includes("debit_card") ? (
        <TabsContent value="debit_card" className="pt-6">
          <CardForm
            method="debit_card"
            submitting={submitting}
            onSubmit={(values) => onSubmitCard("debit_card", values)}
          />
        </TabsContent>
      ) : null}

      {allowedMethods.includes("pix") ? (
        <TabsContent value="pix" className="space-y-4 pt-6">
          <div className="flex items-center justify-center gap-4 rounded-lg bg-brand-green-soft px-4 py-3 text-xs font-medium text-brand-green">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              Liberação imediata
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              100% seguro
            </span>
          </div>
          <PixPanel submitting={submitting} pixDetails={pixDetails} onGenerate={onGeneratePix} />
        </TabsContent>
      ) : null}

      {allowedMethods.includes("boleto") ? (
        <TabsContent value="boleto" className="pt-6">
          <BoletoPanel
            submitting={submitting}
            boletoDetails={boletoDetails}
            onSubmit={onSubmitBoleto}
          />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
