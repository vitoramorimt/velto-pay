"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BoletoPaymentDetails } from "@/domain/entities/payment";
import { maskCpfCnpj } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { boletoFormSchema, type BoletoFormValues } from "@/lib/validators";

interface BoletoPanelProps {
  submitting: boolean;
  boletoDetails: BoletoPaymentDetails | null;
  onSubmit: (values: BoletoFormValues) => void;
}

export function BoletoPanel({ submitting, boletoDetails, onSubmit }: BoletoPanelProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoletoFormValues>({
    resolver: zodResolver(boletoFormSchema),
  });

  if (boletoDetails) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Boleto gerado com sucesso. Pague até o vencimento para confirmar o pedido.
        </p>
        <div className="rounded-md border bg-muted/40 p-3 text-xs font-mono break-all">
          {boletoDetails.barcodeNumber}
        </div>
        <p className="text-xs text-muted-foreground">
          Vencimento: {new Date(boletoDetails.dueDate).toLocaleDateString("pt-BR")}
        </p>
        <a
          href={boletoDetails.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Visualizar boleto (PDF)
        </a>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="payerName">Nome completo</Label>
        <Input id="payerName" placeholder="Nome do pagador" {...register("payerName")} />
        {errors.payerName ? (
          <p className="text-sm text-destructive">{errors.payerName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payerDocument">CPF ou CNPJ</Label>
        <Input
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
          <p className="text-sm text-destructive">{errors.payerDocument.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Gerando boleto..." : "Gerar boleto"}
      </Button>
    </form>
  );
}
