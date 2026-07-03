"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskCpfCnpj, maskPhone } from "@/lib/masks";
import type { CustomerFormValues } from "@/lib/validators";

interface CustomerDataFormProps {
  form: UseFormReturn<CustomerFormValues>;
}

export function CustomerDataForm({ form }: CustomerDataFormProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" placeholder="Preencha seu nome" {...register("fullName")} />
        {errors.fullName ? (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Preencha seu email"
          {...register("email")}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="document">CPF/CNPJ</Label>
          <Input
            id="document"
            inputMode="numeric"
            placeholder="Preencha seu CPF/CNPJ"
            value={watch("document") ?? ""}
            onChange={(event) =>
              setValue("document", maskCpfCnpj(event.target.value), { shouldValidate: true })
            }
          />
          {errors.document ? (
            <p className="text-sm text-destructive">{errors.document.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Celular</Label>
          <Input
            id="phone"
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            value={watch("phone") ?? ""}
            onChange={(event) =>
              setValue("phone", maskPhone(event.target.value), { shouldValidate: true })
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
