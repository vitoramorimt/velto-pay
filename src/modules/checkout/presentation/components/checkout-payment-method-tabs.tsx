"use client";

import { useState } from "react";
import { CreditCard, FileText, QrCode, Wallet } from "lucide-react";

import type { PaymentMethod } from "@/modules/checkout/domain/checkout-form-schemas";
import { cn } from "@/shared/utils/cn";

import { BoletoPanel } from "./checkout-boleto-panel";
import { CardForm } from "./checkout-card-form";
import type { CheckoutOrderItem } from "./checkout-order-summary";
import { PixPanel } from "./checkout-pix-panel";

const METHODS: Array<{
  icon: typeof CreditCard;
  label: string;
  submitLabel: string;
  value: PaymentMethod;
}> = [
  { icon: QrCode, label: "PIX", submitLabel: "Gerar QR Code", value: "pix" },
  {
    icon: CreditCard,
    label: "Crédito",
    submitLabel: "Pagar agora",
    value: "credit_card",
  },
  {
    icon: Wallet,
    label: "Débito",
    submitLabel: "Pagar agora",
    value: "debit_card",
  },
  {
    icon: FileText,
    label: "Boleto",
    submitLabel: "Gerar boleto",
    value: "boleto",
  },
];

type PaymentMethodTabsProps = {
  disabled?: boolean;
  items: CheckoutOrderItem[];
  submitting: boolean;
  totalAmountCents: number;
};

export function PaymentMethodTabs({
  disabled = false,
  items,
  submitting,
  totalAmountCents,
}: PaymentMethodTabsProps) {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("pix");
  const activeConfig = METHODS.find((method) => method.value === activeMethod);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHODS.map((method) => {
          const Icon = method.icon;
          const isActive = activeMethod === method.value;

          return (
            <button
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border hover:border-accent/25 hover:text-foreground",
              )}
              aria-pressed={isActive}
              disabled={disabled}
              key={method.value}
              onClick={() => setActiveMethod(method.value)}
              type="button"
            >
              <Icon className="size-5" />
              <span className="text-[11px] font-medium leading-tight sm:text-xs">
                {method.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeMethod === "pix" ? (
        <PixPanel
          disabled={disabled}
          items={items}
          submitLabel={activeConfig?.submitLabel ?? "Gerar QR Code"}
          submitting={submitting}
          totalAmountCents={totalAmountCents}
        />
      ) : null}

      {activeMethod === "credit_card" || activeMethod === "debit_card" ? (
        <CardForm
          disabled={disabled}
          items={items}
          method={activeMethod}
          submitLabel={activeConfig?.submitLabel ?? "Pagar agora"}
          submitting={submitting}
          totalAmountCents={totalAmountCents}
        />
      ) : null}

      {activeMethod === "boleto" ? (
        <BoletoPanel
          disabled={disabled}
          items={items}
          submitLabel={activeConfig?.submitLabel ?? "Gerar boleto"}
          submitting={submitting}
          totalAmountCents={totalAmountCents}
        />
      ) : null}
    </div>
  );
}
