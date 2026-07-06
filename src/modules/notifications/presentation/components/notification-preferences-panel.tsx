"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateNotificationPreferencesAction } from "@/modules/notifications/application/notification-actions";
import type {
  NotificationPreference,
  NotificationPreferenceInput,
} from "@/modules/notifications/domain/types";

type NotificationPreferencesPanelProps = {
  preferences: NotificationPreference;
};

const preferenceItems: Array<{
  description: string;
  key: keyof NotificationPreferenceInput;
  label: string;
}> = [
  {
    description: "Vendas aprovadas, novos pedidos e novos clientes.",
    key: "sales_enabled",
    label: "Vendas aprovadas",
  },
  {
    description: "Pix gerado, pendente ou expirado.",
    key: "pix_enabled",
    label: "Pix",
  },
  {
    description: "Pagamentos recusados ou falhas no checkout.",
    key: "failed_payments_enabled",
    label: "Pagamentos recusados",
  },
  {
    description: "Reembolsos registrados na operação.",
    key: "refunds_enabled",
    label: "Reembolsos",
  },
  {
    description: "Chargebacks recebidos.",
    key: "chargebacks_enabled",
    label: "Chargebacks",
  },
  {
    description: "Movimentações financeiras relevantes.",
    key: "financial_enabled",
    label: "Financeiro",
  },
];

function toPreferenceInput(
  preferences: NotificationPreference,
): NotificationPreferenceInput {
  return {
    chargebacks_enabled: preferences.chargebacks_enabled,
    failed_payments_enabled: preferences.failed_payments_enabled,
    financial_enabled: preferences.financial_enabled,
    pix_enabled: preferences.pix_enabled,
    refunds_enabled: preferences.refunds_enabled,
    sales_enabled: preferences.sales_enabled,
  };
}

export function NotificationPreferencesPanel({
  preferences,
}: NotificationPreferencesPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<NotificationPreferenceInput>(
    toPreferenceInput(preferences),
  );

  function savePreferences() {
    startTransition(() => {
      void updateNotificationPreferencesAction(draft).then((result) => {
        if (result.status === "success") {
          toast.success(result.message);
          return;
        }

        toast.error(result.message);
      });
    });
  }

  return (
    <section className="rounded-lg border border-border/80 bg-card/90 p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preferências</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Escolha quais alertas deseja receber. As preferências são respeitadas
            antes do envio de push.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={savePreferences}
          type="button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {preferenceItems.map((item) => (
          <label
            className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border/80 bg-muted/25 p-4 transition-all hover:border-accent/25 hover:bg-accent/5"
            key={item.key}
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {item.description}
              </span>
            </span>
            <input
              checked={draft[item.key]}
              className="mt-1 h-5 w-5 shrink-0 accent-[hsl(var(--accent))]"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  [item.key]: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
