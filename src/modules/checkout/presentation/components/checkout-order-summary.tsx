import { Package } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { formatCentsToCurrency } from "@/modules/products/domain/money";

export type CheckoutOrderItem = {
  description?: string | null;
  name: string;
  quantity: number;
  unitAmountCents: number;
};

type OrderSummaryProps = {
  items: CheckoutOrderItem[];
  totalAmountCents: number;
};

export function OrderSummary({ items, totalAmountCents }: OrderSummaryProps) {
  return (
    <div className="space-y-4 pt-3">
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li className="flex min-w-0 items-start gap-3" key={index}>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Package className="size-6 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium">{item.name}</p>
              {item.description ? (
                <p className="break-words text-xs text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
              {item.quantity > 1 ? (
                <p className="text-xs text-muted-foreground">
                  Qtd: {item.quantity}
                </p>
              ) : null}
            </div>
            <span className="whitespace-nowrap text-sm font-medium">
              {formatCentsToCurrency(item.unitAmountCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex min-w-0 items-center justify-between gap-4">
        <span className="font-semibold">Total</span>
        <span className="text-right text-2xl font-semibold text-accent">
          {formatCentsToCurrency(totalAmountCents)}
        </span>
      </div>
    </div>
  );
}

type OrderSummaryInlineProps = {
  items: CheckoutOrderItem[];
  totalAmountCents: number;
};

export function OrderSummaryInline({
  items,
  totalAmountCents,
}: OrderSummaryInlineProps) {
  const [firstItem, ...restItems] = items;

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
      <p className="text-xs font-semibold text-muted-foreground">
        Resumo do pedido
      </p>

      {firstItem ? (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Package className="size-7 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="break-words text-sm font-semibold leading-tight">
              {firstItem.quantity > 1 ? `${firstItem.quantity}x ` : ""}
              {firstItem.name}
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-semibold text-accent">
              <span className="text-base leading-none">
                {formatCentsToCurrency(
                  firstItem.unitAmountCents * firstItem.quantity,
                )}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                à vista
              </span>
            </p>
          </div>
        </div>
      ) : null}

      {restItems.length > 0 ? (
        <ul className="space-y-1">
          {restItems.map((item, index) => (
            <li
              className="flex min-w-0 items-start justify-between gap-3 text-xs"
              key={index}
            >
              <span className="min-w-0 flex-1 break-words text-muted-foreground">
                {item.quantity > 1 ? `${item.quantity}x ` : ""}
                {item.name}
              </span>
              <span className="whitespace-nowrap font-medium">
                {formatCentsToCurrency(item.unitAmountCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex min-w-0 items-center justify-between gap-4 border-t border-border/60 pt-2 text-sm font-semibold">
        <span>Total</span>
        <span className="text-right text-accent">
          {formatCentsToCurrency(totalAmountCents)}
        </span>
      </div>
    </div>
  );
}
