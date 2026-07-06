"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  pixKeyTypeLabels,
  pixKeyTypes,
  type WithdrawalSettingsInput,
} from "@/modules/wallet/domain/schemas";
import type { WithdrawalSettings } from "@/modules/wallet/domain/types";
import {
  saveWithdrawalSettingsAction,
  type WalletActionResult,
} from "@/modules/wallet/presentation/actions";
import { cn } from "@/shared/utils/cn";

type WithdrawalSettingsFormProps = {
  settings: WithdrawalSettings | null;
};

function getInitialValues(
  settings: WithdrawalSettings | null,
): WithdrawalSettingsInput {
  return {
    defaultBankName: settings?.default_bank_name ?? "",
    defaultHolderDocument: settings?.default_holder_document ?? "",
    defaultHolderName: settings?.default_holder_name ?? "",
    defaultPixKey: settings?.default_pix_key ?? "",
    defaultPixKeyType: settings?.default_pix_key_type ?? "cpf",
  };
}

function ActionStatus({ result }: { result: WalletActionResult | null }) {
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

export function WithdrawalSettingsForm({
  settings,
}: WithdrawalSettingsFormProps) {
  const [values, setValues] = useState<WithdrawalSettingsInput>(
    getInitialValues(settings),
  );
  const [result, setResult] = useState<WalletActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<Field extends keyof WithdrawalSettingsInput>(
    field: Field,
    value: WithdrawalSettingsInput[Field],
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
      setResult(await saveWithdrawalSettingsAction(values));
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <ActionStatus result={result} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="defaultPixKeyType">Tipo de chave Pix</Label>
          <Select
            onValueChange={(value) =>
              updateField(
                "defaultPixKeyType",
                value as WithdrawalSettingsInput["defaultPixKeyType"],
              )
            }
            value={values.defaultPixKeyType}
          >
            <SelectTrigger id="defaultPixKeyType">
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
          <Label htmlFor="defaultPixKey">Chave Pix</Label>
          <Input
            id="defaultPixKey"
            onChange={(event) =>
              updateField("defaultPixKey", event.target.value)
            }
            placeholder="Digite sua chave Pix"
            value={values.defaultPixKey}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="defaultHolderName">Nome do titular</Label>
          <Input
            id="defaultHolderName"
            onChange={(event) =>
              updateField("defaultHolderName", event.target.value)
            }
            placeholder="Nome completo"
            value={values.defaultHolderName}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="defaultHolderDocument">CPF/CNPJ do titular</Label>
          <Input
            id="defaultHolderDocument"
            onChange={(event) =>
              updateField("defaultHolderDocument", event.target.value)
            }
            placeholder="Somente números"
            value={values.defaultHolderDocument}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="defaultBankName">Banco</Label>
        <Input
          id="defaultBankName"
          onChange={(event) =>
            updateField("defaultBankName", event.target.value)
          }
          placeholder="Opcional"
          value={values.defaultBankName ?? ""}
        />
      </div>

      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">
          <Save className="h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar chave Pix"}
        </Button>
      </div>
    </form>
  );
}
