import { Package } from "lucide-react";

import { formatCents } from "@/lib/format-money";

import type { CheckoutSessionItemView } from "./types";

interface OrderSummaryInlineProps {
  items: CheckoutSessionItemView[];
  totalAmountCents: number;
}

export function OrderSummaryInline({ items, totalAmountCents }: OrderSummaryInlineProps) {
  const [firstItem, ...restItems] = items;

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
      <p className="text-xs font-semibold text-muted-foreground">Resumo do pedido</p>

      {firstItem ? (
        <div className="flex items-center gap-1.5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Package className="size-7 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold">
              {firstItem.quantity > 1 ? `${firstItem.quantity}x ` : ""}
              {firstItem.name}
            </p>
            <p className="text-sm font-semibold text-brand-green">
              {formatCents(firstItem.unitAmountCents * firstItem.quantity)}{" "}
              <span className="text-xs font-normal text-muted-foreground">à vista</span>
            </p>
          </div>
        </div>
      ) : null}

      {restItems.length > 0 ? (
        <ul className="space-y-1">
          {restItems.map((item, index) => (
            <li key={index} className="flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {item.quantity > 1 ? `${item.quantity}x ` : ""}
                {item.name}
              </span>
              <span className="whitespace-nowrap font-medium">
                {formatCents(item.unitAmountCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm font-semibold">
        <span>Total</span>
        <span className="text-brand-green">{formatCents(totalAmountCents)}</span>
      </div>
    </div>
  );
}
