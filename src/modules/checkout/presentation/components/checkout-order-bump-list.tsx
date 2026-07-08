"use client";

import { Plus } from "lucide-react";

import { formatCentsToCurrency } from "@/modules/products/domain/money";
import type { CheckoutOffer } from "@/modules/checkout/domain/types";
import { cn } from "@/shared/utils/cn";

type OrderBumpListProps = {
  disabled?: boolean;
  offers: CheckoutOffer[];
  onToggle?: (offerId: string) => void;
  selectedIds: Set<string>;
};

export function OrderBumpList({
  disabled = false,
  offers,
  onToggle,
  selectedIds,
}: OrderBumpListProps) {
  return (
    <div className="space-y-2">
      {offers.map((offer) => {
        const isSelected = selectedIds.has(offer.id);

        return (
          <label
            className={cn(
              "flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              isSelected
                ? "border-accent/50 bg-accent/5"
                : "border-border/60 hover:border-border",
              disabled && "cursor-not-allowed opacity-70",
            )}
            key={offer.id}
          >
            <input
              checked={isSelected}
              className="mt-1 size-4 shrink-0 accent-accent"
              disabled={disabled}
              name="orderBumpIds"
              onChange={() => onToggle?.(offer.id)}
              type="checkbox"
              value={offer.id}
            />
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Plus className="size-4" />
            </span>
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="break-words text-sm font-medium">
                  {offer.title}
                </span>
                {offer.badge_text ? (
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {offer.badge_text}
                  </span>
                ) : null}
              </span>
              {offer.description ? (
                <span className="block break-words text-xs text-muted-foreground">
                  {offer.description}
                </span>
              ) : null}
              <span className="block text-sm font-semibold text-accent">
                + {formatCentsToCurrency(offer.amount_cents)}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
