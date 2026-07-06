"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  boletoFormSchema,
  type BoletoFormValues,
} from "@/modules/checkout/domain/checkout-form-schemas";
import { maskCpfCnpj } from "@/shared/utils/payment-masks";

import type { CheckoutOrderItem } from "./checkout-order-summary";
import { OrderSummaryInline } from "./checkout-order-summary";

type BoletoPanelProps = {
  disabled?: boolean;
  items: CheckoutOrderItem[];
  submitLabel: string;
  submitting: boolean;
  totalAmountCents: number;
};

export function BoletoPanel({
  disabled = false,
  items,
  submitLabel,
  submitting,
  totalAmountCents,
}: BoletoPanelProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoletoFormValues>({
    resolver: zodResolver(boletoFormSchema),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="payerName">Nome completo</Label>
        <Input
          disabled={disabled}
          id="payerName"
          placeholder="Nome do pagador"
          {...register("payerName")}
        />
        {errors.payerName ? (
          <p className="text-sm text-destructive">
            {errors.payerName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payerDocument">CPF ou CNPJ</Label>
        <Input
          disabled={disabled}
          id="payerDocument"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={watch("payerDocument") ?? ""}
          onChange={(event) =>
            setValue("payerDocument", maskCpfCnpj(event.target.value), {
              shouldValidate: true,
            })
          }
        />
        {errors.payerDocument ? (
          <p className="text-sm text-destructive">
            {errors.payerDocument.message}
          </p>
        ) : null}
      </div>

      <OrderSummaryInline items={items} totalAmountCents={totalAmountCents} />

      <Button className="w-full" disabled={disabled || submitting} type="submit">
        {submitting ? "Gerando boleto..." : submitLabel}
      </Button>
    </div>
  );
}
