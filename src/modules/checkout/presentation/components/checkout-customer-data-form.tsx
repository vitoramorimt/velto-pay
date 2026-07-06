"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerFormValues } from "@/modules/checkout/domain/checkout-form-schemas";
import { maskCpfCnpj, maskPhone } from "@/shared/utils/payment-masks";

type CustomerDataFormProps = {
  disabled?: boolean;
  form: UseFormReturn<CustomerFormValues>;
};

export function CustomerDataForm({
  disabled = false,
  form,
}: CustomerDataFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Nome completo</Label>
        <Input
          disabled={disabled}
          id="customerName"
          placeholder="Preencha seu nome"
          required={!disabled}
          {...register("customerName")}
        />
        {errors.customerName ? (
          <p className="text-sm text-destructive">
            {errors.customerName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerEmail">Email</Label>
        <Input
          disabled={disabled}
          id="customerEmail"
          placeholder="Preencha seu email"
          required={!disabled}
          type="email"
          {...register("customerEmail")}
        />
        {errors.customerEmail ? (
          <p className="text-sm text-destructive">
            {errors.customerEmail.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            disabled={disabled}
            id="document"
            inputMode="numeric"
            name="document"
            placeholder="Preencha seu CPF/CNPJ"
            value={watch("document") ?? ""}
            onChange={(event) =>
              setValue("document", maskCpfCnpj(event.target.value), {
                shouldValidate: true,
              })
            }
          />
          {errors.document ? (
            <p className="text-sm text-destructive">
              {errors.document.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Celular</Label>
          <Input
            disabled={disabled}
            id="phone"
            inputMode="numeric"
            name="phone"
            placeholder="(00) 00000-0000"
            value={watch("phone") ?? ""}
            onChange={(event) =>
              setValue("phone", maskPhone(event.target.value), {
                shouldValidate: true,
              })
            }
          />
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
