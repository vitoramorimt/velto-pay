import { Button } from "@/components/ui/button";

import type { CheckoutOrderItem } from "./checkout-order-summary";
import { OrderSummaryInline } from "./checkout-order-summary";

type PixPanelProps = {
  disabled?: boolean;
  items: CheckoutOrderItem[];
  submitLabel: string;
  submitting: boolean;
  totalAmountCents: number;
};

export function PixPanel({
  disabled = false,
  items,
  submitLabel,
  submitting,
  totalAmountCents,
}: PixPanelProps) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        Gere um QR Code PIX e pague instantaneamente pelo app do seu banco.
      </p>
      <OrderSummaryInline items={items} totalAmountCents={totalAmountCents} />
      <Button className="w-full" disabled={disabled || submitting} type="submit">
        {submitting ? "Gerando..." : submitLabel}
      </Button>
    </div>
  );
}
