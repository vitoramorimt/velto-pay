import { ShieldCheck } from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import type { CheckoutProduct } from "@/modules/checkout/domain/types";

import { CheckoutForm } from "./checkout-form";
import type { CheckoutOrderItem } from "./checkout-order-summary";
import { OrderSummarySidebar } from "./checkout-order-summary-sidebar";

type CheckoutTemplateProps = {
  checkoutSlug?: string;
  errorReason?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  product: CheckoutProduct;
  showError?: boolean;
  showSuccess?: boolean;
  variant?: "public" | "preview";
};

export function CheckoutTemplate({
  checkoutSlug,
  errorReason,
  formAction,
  product,
  showError = false,
  showSuccess = false,
  variant = "public",
}: CheckoutTemplateProps) {
  const isPreview = variant === "preview";
  const items: CheckoutOrderItem[] = [
    {
      description: "Acesso ao produto digital",
      name: product.name,
      quantity: 1,
      unitAmountCents: product.price_cents,
    },
  ];

  return (
    <main className="velto-checkout-shell dark relative min-h-dvh overflow-hidden bg-background px-4 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(25,205,139,0.16),transparent)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-2 pb-8">
        <VeltoLogo showLabel size={44} />
        {isPreview ? (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Pré-visualização
          </span>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <CheckoutForm
          checkoutSlug={checkoutSlug}
          errorReason={errorReason}
          formAction={formAction}
          isPreview={isPreview}
          items={items}
          showError={showError}
          showSuccess={showSuccess}
          totalAmountCents={product.price_cents}
        />

        <div className="flex flex-col gap-6">
          <OrderSummarySidebar
            items={items}
            totalAmountCents={product.price_cents}
          />
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-accent" />
            Pagamento processado com segurança pela Velto Pay
          </p>
        </div>
      </div>
    </main>
  );
}
