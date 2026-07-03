import { Package } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { formatCents } from "@/lib/format-money";

import type { CheckoutSessionItemView } from "./types";

interface OrderSummaryProps {
  merchantName: string;
  items: CheckoutSessionItemView[];
  totalAmountCents: number;
}

export function OrderSummary({ merchantName, items, totalAmountCents }: OrderSummaryProps) {
  return (
    <div className="space-y-4 pt-3">
      <p className="text-xs text-muted-foreground">
        Você está pagando para <span className="font-medium text-foreground">{merchantName}</span>
      </p>

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Package className="size-6 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              {item.description ? (
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              ) : null}
              {item.quantity > 1 ? (
                <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
              ) : null}
            </div>
            <span className="whitespace-nowrap text-sm font-medium">
              {formatCents(item.unitAmountCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-semibold text-brand-green">
          {formatCents(totalAmountCents)}
        </span>
      </div>
    </div>
  );
}
