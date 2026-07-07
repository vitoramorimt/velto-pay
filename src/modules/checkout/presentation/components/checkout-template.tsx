"use client";

import { useState, type CSSProperties } from "react";
import { BadgeCheck, LifeBuoy, Moon, ShieldCheck, Sun } from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { Button } from "@/components/ui/button";
import type { CheckoutBadge, CheckoutBadgeId } from "@/modules/checkout/domain/badges";
import { hexToHslTriplet, isValidHexColor } from "@/modules/checkout/domain/color";
import type { CheckoutProduct, CheckoutTheme } from "@/modules/checkout/domain/types";
import { cn } from "@/shared/utils/cn";

import { CheckoutForm } from "./checkout-form";
import type { CheckoutOrderItem } from "./checkout-order-summary";
import { OrderSummarySidebar } from "./checkout-order-summary-sidebar";

const BADGE_ICONS: Record<CheckoutBadgeId, typeof ShieldCheck> = {
  guarantee: BadgeCheck,
  secure_payment: ShieldCheck,
  support: LifeBuoy,
};

type CheckoutTemplateProps = {
  badges?: CheckoutBadge[];
  checkoutSlug?: string;
  description?: string | null;
  errorReason?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  headline?: string | null;
  primaryColor?: string | null;
  product: CheckoutProduct;
  showError?: boolean;
  showSuccess?: boolean;
  theme?: CheckoutTheme;
  variant?: "public" | "preview";
};

export function CheckoutTemplate({
  badges = [],
  checkoutSlug,
  description,
  errorReason,
  formAction,
  headline,
  primaryColor,
  product,
  showError = false,
  showSuccess = false,
  theme = "dark",
  variant = "public",
}: CheckoutTemplateProps) {
  const [activeTheme, setActiveTheme] = useState<CheckoutTheme>(theme);
  const isPreview = variant === "preview";
  const displayName = headline?.trim() || product.name;
  const displayDescription = description?.trim() || null;
  const enabledBadges = badges.filter((badge) => badge.enabled);
  const accentStyle: CSSProperties | undefined =
    primaryColor && isValidHexColor(primaryColor)
      ? ({ "--accent": hexToHslTriplet(primaryColor) } as CSSProperties)
      : undefined;
  const items: CheckoutOrderItem[] = [
    {
      description: "Acesso ao produto digital",
      name: displayName,
      quantity: 1,
      unitAmountCents: product.price_cents,
    },
  ];

  return (
    <main
      className={cn(
        "velto-checkout-shell relative min-h-dvh overflow-x-clip bg-background text-foreground",
        activeTheme,
      )}
      style={{
        ...accentStyle,
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(25,205,139,0.16),transparent)]"
      />

      <Button
        aria-label={
          activeTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
        }
        className="absolute z-20 size-10 rounded-full border border-border bg-card/85 text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:ring-offset-0"
        onClick={() =>
          setActiveTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          top: "max(1rem, env(safe-area-inset-top))",
        }}
        variant="ghost"
        size="icon"
        type="button"
      >
        {activeTheme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </Button>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-2 pb-8 pt-1 text-center">
        <VeltoLogo showLabel size={44} />
        {isPreview ? (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Pré-visualização
          </span>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <CheckoutForm
          checkoutSlug={checkoutSlug}
          description={displayDescription}
          errorReason={errorReason}
          formAction={formAction}
          product={product}
          isPreview={isPreview}
          items={items}
          showError={showError}
          showSuccess={showSuccess}
          totalAmountCents={product.price_cents}
        />

        <div className="flex min-w-0 flex-col gap-6">
          <OrderSummarySidebar
            items={items}
            totalAmountCents={product.price_cents}
          />

          {enabledBadges.length > 0 ? (
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
              {enabledBadges.map((badge) => {
                const Icon = BADGE_ICONS[badge.id];

                return (
                  <span
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground"
                    key={badge.id}
                  >
                    <Icon className="size-3.5 text-accent" />
                    <span className="min-w-0 truncate">{badge.label}</span>
                  </span>
                );
              })}
            </div>
          ) : null}

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-accent" />
            Pagamento processado com segurança pela Velto Pay
          </p>
        </div>
      </div>
    </main>
  );
}
