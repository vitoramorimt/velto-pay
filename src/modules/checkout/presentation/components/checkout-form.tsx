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
import type { CheckoutProduct } from "@/modules/checkout/domain/types";

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
  product: CheckoutProduct;
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
  product,
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
      <Card className="min-w-0 w-full max-w-full overflow-hidden border-border/60 shadow-xl shadow-black/30">
        <CardContent className="pt-6">
          <SuccessView message="Enviamos os próximos passos para o e-mail informado." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 w-full max-w-full overflow-hidden border-border/60 shadow-xl shadow-black/30">
      <CardContent className="min-w-0 space-y-5 pt-6">
        <div className="grid min-w-0 gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-secondary/50">
            {product.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                alt={items[0]?.name ?? product.name}
                className="aspect-square h-full w-full object-cover"
                decoding="async"
                loading="eager"
                src={product.image_url}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center">
                <Package className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="line-clamp-2 text-base font-semibold leading-tight">
              {items[0]?.name}
            </p>
            {description ? (
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-semibold text-accent">
              <span className="text-lg leading-none">
                {formatCentsToCurrency(totalAmountCents)}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                à vista
              </span>
            </p>
          </div>
        </div>

        <Separator />

        <form
          action={formAction}
          className="min-w-0 space-y-5"
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

          <div className="space-y-1">
            <p className="text-sm font-semibold">Forma de pagamento</p>
            <p className="text-xs leading-5 text-muted-foreground">
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
