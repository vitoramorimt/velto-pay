"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cardFormSchema,
  type CardFormValues,
  type PaymentMethod,
} from "@/modules/checkout/domain/checkout-form-schemas";
import { maskCardNumber, maskCvv, maskExpiry } from "@/shared/utils/payment-masks";

import type { CheckoutOrderItem } from "./checkout-order-summary";
import { OrderSummaryInline } from "./checkout-order-summary";

type CardFormProps = {
  disabled?: boolean;
  items: CheckoutOrderItem[];
  method: Extract<PaymentMethod, "credit_card" | "debit_card">;
  submitLabel: string;
  submitting: boolean;
  totalAmountCents: number;
};

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function CardForm({
  disabled = false,
  items,
  method,
  submitLabel,
  submitting,
  totalAmountCents,
}: CardFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormValues>({
    defaultValues: { installments: 1 },
    resolver: zodResolver(cardFormSchema),
  });

  const isCredit = method === "credit_card";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="holderName">Nome no cartão</Label>
        <Input
          autoComplete="cc-name"
          disabled={disabled}
          id="holderName"
          placeholder="Como está impresso no cartão"
          aria-invalid={Boolean(errors.holderName) || undefined}
          {...register("holderName")}
        />
        {errors.holderName ? (
          <p className="text-sm text-destructive">
            {errors.holderName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Número do cartão</Label>
        <Input
          autoComplete="cc-number"
          disabled={disabled}
          id="number"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          value={watch("number") ?? ""}
          aria-invalid={Boolean(errors.number) || undefined}
          onChange={(event) =>
            setValue("number", maskCardNumber(event.target.value), {
              shouldValidate: true,
            })
          }
        />
        {errors.number ? (
          <p className="text-sm text-destructive">{errors.number.message}</p>
        ) : null}
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Validade</Label>
          <Input
            autoComplete="cc-exp"
            disabled={disabled}
            id="expiry"
            inputMode="numeric"
            placeholder="MM/AA"
            value={watch("expiry") ?? ""}
            aria-invalid={Boolean(errors.expiry) || undefined}
            onChange={(event) =>
              setValue("expiry", maskExpiry(event.target.value), {
                shouldValidate: true,
              })
            }
          />
          {errors.expiry ? (
            <p className="text-sm text-destructive">
              {errors.expiry.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            autoComplete="cc-csc"
            disabled={disabled}
            id="cvv"
            inputMode="numeric"
            placeholder="000"
            value={watch("cvv") ?? ""}
            aria-invalid={Boolean(errors.cvv) || undefined}
            onChange={(event) =>
              setValue("cvv", maskCvv(event.target.value), {
                shouldValidate: true,
              })
            }
          />
          {errors.cvv ? (
            <p className="text-sm text-destructive">{errors.cvv.message}</p>
          ) : null}
        </div>
      </div>

      {isCredit ? (
        <div className="space-y-2">
          <Label htmlFor="installments">Parcelas</Label>
          <select
            className="flex h-10 w-full max-w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors hover:border-accent/25 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            disabled={disabled}
            id="installments"
            {...register("installments", { valueAsNumber: true })}
          >
            {INSTALLMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}x sem juros
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <OrderSummaryInline items={items} totalAmountCents={totalAmountCents} />

      <Button className="w-full" disabled={disabled || submitting} type="submit">
        {submitting ? "Processando..." : submitLabel}
      </Button>
    </div>
  );
}
