"use client";

import { useState, useTransition } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCentsToCurrency,
  maskPriceInputFromDigits,
} from "@/modules/products/domain/money";
import {
  pixKeyTypeLabels,
  pixKeyTypes,
  type WithdrawalRequestInput,
} from "@/modules/wallet/domain/schemas";
import { createWithdrawalRequestDefaults } from "@/modules/wallet/domain/withdrawals";
import type { WithdrawalSettings } from "@/modules/wallet/domain/types";
import {
  requestWithdrawalAction,
  type WalletActionResult,
} from "@/modules/wallet/presentation/actions";
import { cn } from "@/shared/utils/cn";

type WithdrawalRequestDialogProps = {
  availableBalanceCents: number;
  settings: WithdrawalSettings | null;
};

function getInitialValues(
  settings: WithdrawalSettings | null,
): WithdrawalRequestInput {
  return createWithdrawalRequestDefaults(settings);
}

function DialogStatus({ result }: { result: WalletActionResult | null }) {
  if (!result) {
    return null;
  }

  const isSuccess = result.status === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        isSuccess
          ? "border-success/25 bg-success/10 text-success"
          : "border-destructive/25 bg-destructive/10 text-destructive",
      )}
      role={isSuccess ? "status" : "alert"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}

export function WithdrawalRequestDialog({
  availableBalanceCents,
  settings,
}: WithdrawalRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<WithdrawalRequestInput>(
    getInitialValues(settings),
  );
  const [result, setResult] = useState<WalletActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasBalance = availableBalanceCents > 0;

  function updateField<Field extends keyof WithdrawalRequestInput>(
    field: Field,
    value: WithdrawalRequestInput[Field],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    startTransition(async () => {
      const actionResult = await requestWithdrawalAction(values);

      setResult(actionResult);

      if (actionResult.status === "success") {
        setValues(getInitialValues(settings));
        window.setTimeout(() => setOpen(false), 600);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasBalance}>
          <ArrowUpRight className="h-4 w-4" />
          Solicitar saque
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
              <Wallet className="h-4 w-4" />
            </span>
            Solicitar saque
          </DialogTitle>
          <DialogDescription>
            Saldo disponível: {formatCentsToCurrency(availableBalanceCents)}. O
            Pix real ainda será processado manualmente pela operação.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogStatus result={result} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="withdrawalAmount">Valor</Label>
              <Input
                id="withdrawalAmount"
                inputMode="numeric"
                onChange={(event) =>
                  updateField(
                    "amount",
                    maskPriceInputFromDigits(event.target.value),
                  )
                }
                placeholder="R$ 0,00"
                value={values.amount}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pixKeyType">Tipo de chave Pix</Label>
              <Select
                onValueChange={(value) =>
                  updateField(
                    "pixKeyType",
                    value as WithdrawalRequestInput["pixKeyType"],
                  )
                }
                value={values.pixKeyType}
              >
                <SelectTrigger id="pixKeyType">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {pixKeyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {pixKeyTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pixKey">Chave Pix</Label>
              <Input
                id="pixKey"
                onChange={(event) => updateField("pixKey", event.target.value)}
                placeholder="Digite a chave Pix"
                value={values.pixKey}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="holderName">Nome do titular</Label>
              <Input
                id="holderName"
                onChange={(event) =>
                  updateField("holderName", event.target.value)
                }
                placeholder="Nome completo"
                value={values.holderName}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="holderDocument">CPF/CNPJ do titular</Label>
              <Input
                id="holderDocument"
                onChange={(event) =>
                  updateField("holderDocument", event.target.value)
                }
                placeholder="Somente números"
                value={values.holderDocument}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bankName">Banco</Label>
              <Input
                id="bankName"
                onChange={(event) =>
                  updateField("bankName", event.target.value)
                }
                placeholder="Opcional"
                value={values.bankName ?? ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button disabled={isPending || !hasBalance} type="submit">
              {isPending ? "Solicitando..." : "Confirmar saque"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
