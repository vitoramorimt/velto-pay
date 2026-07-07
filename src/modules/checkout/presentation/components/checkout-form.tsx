"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Package, User } from "lucide-react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/modules/checkout/domain/checkout-form-schemas";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

import { CustomerDataForm } from "./checkout-customer-data-form";
import { ErrorView, SuccessView } from "./checkout-flow-views";
import type { CheckoutOrderItem } from "./checkout-order-summary";
import { PaymentMethodTabs } from "./checkout-payment-method-tabs";

type CheckoutFormProps = {
  checkoutSlug?: string;
  description?: string | null;
  errorReason?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  isPreview?: boolean;
  items: CheckoutOrderItem[];
  showError?: boolean;
  showSuccess?: boolean;
  totalAmountCents: number;
};

export function CheckoutForm({
  checkoutSlug,
  description,
  errorReason,
  formAction,
  isPreview = false,
  items,
  showError = false,
  showSuccess = false,
  totalAmountCents,
}: CheckoutFormProps) {
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  });
  const errorMessage =
    errorReason === "configuracao"
      ? "O checkout ainda não está configurado para receber pagamentos. Tente novamente em instantes ou entre em contato com o produtor."
      : "Não foi possível iniciar o pedido. Revise seus dados e tente novamente.";

  if (showSuccess) {
    return (
      <Card className="w-full border-border/60 shadow-xl shadow-black/30">
        <CardContent className="pt-6">
          <SuccessView message="Enviamos os próximos passos para o e-mail informado." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/60 shadow-xl shadow-black/30">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-center gap-3">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Package className="size-7 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{items[0]?.name}</p>
            {description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
            <p className="text-sm font-semibold text-accent">
              {formatCentsToCurrency(totalAmountCents)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                à vista
              </span>
            </p>
          </div>
        </div>

        <Separator />

        <form
          action={formAction}
          className="space-y-5"
          onSubmit={isPreview ? (event) => event.preventDefault() : undefined}
        >
          {checkoutSlug ? (
            <input name="slug" type="hidden" value={checkoutSlug} />
          ) : null}

          <div className="space-y-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <User className="size-4 text-muted-foreground" />
              Seus dados
            </p>
            <CustomerDataForm disabled={isPreview} form={customerForm} />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-semibold">Forma de pagamento</p>
            <p className="text-xs text-muted-foreground">
              Escolha como deseja pagar e preencha os dados abaixo.
            </p>
          </div>

          {showError ? <ErrorView message={errorMessage} /> : null}

          <PaymentMethodTabs
            disabled={isPreview}
            items={items}
            submitting={false}
            totalAmountCents={totalAmountCents}
          />
        </form>
      </CardContent>
    </Card>
  );
}
