"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/domain/entities/payment";
import { maskCardNumber, maskCvv, maskExpiry } from "@/lib/masks";
import { cardFormSchema, type CardFormValues } from "@/lib/validators";

import { OrderSummaryInline } from "./order-summary-inline";
import type { CheckoutSessionItemView } from "./types";

interface CardFormProps {
  method: Extract<PaymentMethod, "credit_card" | "debit_card">;
  submitting: boolean;
  items: CheckoutSessionItemView[];
  totalAmountCents: number;
  onSubmit: (values: CardFormValues) => void;
}

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function CardForm({
  method,
  submitting,
  items,
  totalAmountCents,
  onSubmit,
}: CardFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { installments: 1 },
  });

  const isCredit = method === "credit_card";

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="holderName">Nome no cartão</Label>
        <Input
          id="holderName"
          placeholder="Como está impresso no cartão"
          autoComplete="cc-name"
          {...register("holderName")}
        />
        {errors.holderName ? (
          <p className="text-sm text-destructive">{errors.holderName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Número do cartão</Label>
        <Input
          id="number"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          autoComplete="cc-number"
          value={watch("number") ?? ""}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Validade</Label>
          <Input
            id="expiry"
            inputMode="numeric"
            placeholder="MM/AA"
            autoComplete="cc-exp"
            value={watch("expiry") ?? ""}
            onChange={(event) =>
              setValue("expiry", maskExpiry(event.target.value), {
                shouldValidate: true,
              })
            }
          />
          {errors.expiry ? (
            <p className="text-sm text-destructive">{errors.expiry.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            inputMode="numeric"
            placeholder="000"
            autoComplete="cc-csc"
            value={watch("cvv") ?? ""}
            onChange={(event) =>
              setValue("cvv", maskCvv(event.target.value), { shouldValidate: true })
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
            id="installments"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            {...register("installments", { valueAsNumber: true })}
          >
            {INSTALLMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}x {option === 1 ? "sem juros" : "sem juros"}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <OrderSummaryInline items={items} totalAmountCents={totalAmountCents} />

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Processando..." : "Pagar agora"}
      </Button>
    </form>
  );
}
