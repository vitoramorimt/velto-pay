import { ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  OrderSummary,
  type CheckoutOrderItem,
} from "./checkout-order-summary";

type OrderSummarySidebarProps = {
  items: CheckoutOrderItem[];
  securePurchaseEnabled?: boolean;
  totalAmountCents: number;
};

export function OrderSummarySidebar({
  items,
  securePurchaseEnabled = true,
  totalAmountCents,
}: OrderSummarySidebarProps) {
  return (
    <Card className="min-w-0 max-w-full overflow-hidden border-border/60 py-0 shadow-xl shadow-black/30 lg:sticky lg:top-10">
      {securePurchaseEnabled ? (
        <div className="flex min-w-0 items-center gap-1.5 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground">
          <ShieldCheck className="size-4" />
          <span className="min-w-0 break-words">Compra segura</span>
        </div>
      ) : null}
      <CardContent className="min-w-0 pb-6">
        <OrderSummary items={items} totalAmountCents={totalAmountCents} />
      </CardContent>
    </Card>
  );
}
