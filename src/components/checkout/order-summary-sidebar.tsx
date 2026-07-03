import { ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { OrderSummary } from "./order-summary";
import type { CheckoutSessionItemView } from "./types";

interface OrderSummarySidebarProps {
  merchantName: string;
  items: CheckoutSessionItemView[];
  totalAmountCents: number;
}

export function OrderSummarySidebar({
  merchantName,
  items,
  totalAmountCents,
}: OrderSummarySidebarProps) {
  return (
    <Card className="overflow-hidden border-border/60 py-0 shadow-xl shadow-black/30 lg:sticky lg:top-10">
      <div className="flex items-center gap-1.5 bg-brand-green px-4 py-2.5 text-sm font-semibold text-primary-foreground">
        <ShieldCheck className="size-4" />
        Compra segura
      </div>
      <CardContent className="pb-6">
        <OrderSummary
          merchantName={merchantName}
          items={items}
          totalAmountCents={totalAmountCents}
        />
      </CardContent>
    </Card>
  );
}
