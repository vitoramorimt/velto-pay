"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Gift,
  HelpCircle,
  LifeBuoy,
  Moon,
  Quote,
  ShieldCheck,
  Sun,
  Timer,
} from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { Button } from "@/components/ui/button";
import type { CheckoutBadge, CheckoutBadgeId } from "@/modules/checkout/domain/badges";
import { hexToHslTriplet, isValidHexColor } from "@/modules/checkout/domain/color";
import type { CheckoutProduct, CheckoutTheme } from "@/modules/checkout/domain/types";
import type { OfferConversionContent } from "@/modules/offers/domain/types";
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
  bannerUrl?: string | null;
  checkoutSlug?: string;
  description?: string | null;
  errorReason?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  headline?: string | null;
  logoUrl?: string | null;
  offerContent?: OfferConversionContent;
  primaryColor?: string | null;
  product: CheckoutProduct;
  securePurchaseEnabled?: boolean;
  showError?: boolean;
  showSuccess?: boolean;
  theme?: CheckoutTheme;
  variant?: "public" | "preview";
};

export function CheckoutTemplate({
  badges = [],
  bannerUrl,
  checkoutSlug,
  description,
  errorReason,
  formAction,
  headline,
  logoUrl,
  offerContent,
  primaryColor,
  product,
  securePurchaseEnabled = true,
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

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-2 pb-6 pt-1 text-center">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={displayName}
            className="max-h-14 max-w-48 object-contain"
            decoding="async"
            loading="eager"
            src={logoUrl}
          />
        ) : (
          <VeltoLogo showLabel size={44} />
        )}
        {isPreview ? (
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Pré-visualização
          </span>
        ) : null}
      </div>

      {bannerUrl ? (
        <div className="relative z-10 mx-auto mb-6 w-full max-w-5xl overflow-hidden rounded-lg border border-border/60 bg-card shadow-xl shadow-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="aspect-[16/5] w-full object-cover"
            decoding="async"
            loading="eager"
            src={bannerUrl}
          />
        </div>
      ) : null}

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
            securePurchaseEnabled={securePurchaseEnabled}
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

      {offerContent ? (
        <OfferContentSections content={offerContent} />
      ) : null}
    </main>
  );
}

function OfferContentSections({ content }: { content: OfferConversionContent }) {
  const completeBenefits = content.benefits.filter((benefit) =>
    benefit.text.trim(),
  );
  const completeFaqs = content.faqs.filter(
    (faq) => faq.question.trim() || faq.answer.trim(),
  );
  const completeTestimonials = content.testimonials.filter(
    (testimonial) => testimonial.name.trim() || testimonial.quote.trim(),
  );
  const completeBonuses = content.bonuses.filter(
    (bonus) => bonus.title.trim() || bonus.description.trim(),
  );
  const completeTrustSeals = content.trustSeals.filter((seal) =>
    seal.label.trim(),
  );
  const hasContent =
    completeBenefits.length > 0 ||
    content.guarantee.trim() ||
    completeFaqs.length > 0 ||
    completeTestimonials.length > 0 ||
    completeBonuses.length > 0 ||
    content.urgencyText.trim() ||
    completeTrustSeals.length > 0 ||
    content.countdownEnabled;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="relative z-10 mx-auto mt-8 grid w-full max-w-5xl gap-4 pb-2">
      {content.countdownEnabled || content.urgencyText.trim() ? (
        <div className="rounded-lg border border-accent/25 bg-accent/10 p-4 text-center text-accent">
          {content.countdownEnabled ? (
            <OfferCountdown endsAt={content.countdownEndsAt} />
          ) : null}
          {content.urgencyText.trim() ? (
            <p className="mt-1 text-sm font-medium">{content.urgencyText}</p>
          ) : null}
        </div>
      ) : null}

      {completeBenefits.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {completeBenefits.map((benefit) => (
            <div
              className="flex min-w-0 items-start gap-3 rounded-lg border border-border/60 bg-card/75 p-4"
              key={benefit.id}
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
              <p className="break-words text-sm leading-6">{benefit.text}</p>
            </div>
          ))}
        </div>
      ) : null}

      {content.guarantee.trim() ? (
        <div className="rounded-lg border border-border/60 bg-card/75 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BadgeCheck className="size-4 text-accent" />
            Garantia
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
            {content.guarantee}
          </p>
        </div>
      ) : null}

      {completeBonuses.length > 0 ? (
        <OfferListBlock
          icon={Gift}
          items={completeBonuses.map((bonus) => ({
            description: bonus.description,
            id: bonus.id,
            meta: bonus.value,
            title: bonus.title,
          }))}
          title="Bônus"
        />
      ) : null}

      {completeTestimonials.length > 0 ? (
        <OfferListBlock
          icon={Quote}
          items={completeTestimonials.map((testimonial) => ({
            description: testimonial.quote,
            id: testimonial.id,
            meta: testimonial.role,
            title: testimonial.name,
          }))}
          title="Depoimentos"
        />
      ) : null}

      {completeFaqs.length > 0 ? (
        <OfferListBlock
          icon={HelpCircle}
          items={completeFaqs.map((faq) => ({
            description: faq.answer,
            id: faq.id,
            title: faq.question,
          }))}
          title="FAQ"
        />
      ) : null}

      {completeTrustSeals.length > 0 ? (
        <div className="flex min-w-0 flex-wrap justify-center gap-2">
          {completeTrustSeals.map((seal) => (
            <span
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground"
              key={seal.id}
            >
              <ShieldCheck className="size-3.5 shrink-0 text-accent" />
              <span className="min-w-0 truncate">{seal.label}</span>
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function OfferCountdown({ endsAt }: { endsAt: string }) {
  const target = useMemo(() => {
    const timestamp = Date.parse(endsAt);

    return Number.isFinite(timestamp) ? timestamp : null;
  }, [endsAt]);
  const [remainingMs, setRemainingMs] = useState(() =>
    target ? Math.max(target - Date.now(), 0) : 0,
  );

  useEffect(() => {
    if (!target) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingMs(Math.max(target - Date.now(), 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [target]);

  if (!target) {
    return (
      <p className="flex items-center justify-center gap-2 text-sm font-semibold">
        <Timer className="size-4" />
        Oferta por tempo limitado
      </p>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    days > 0 ? `${days}d` : null,
    `${hours.toString().padStart(2, "0")}h`,
    `${minutes.toString().padStart(2, "0")}m`,
    `${seconds.toString().padStart(2, "0")}s`,
  ].filter(Boolean);

  return (
    <p className="flex items-center justify-center gap-2 text-sm font-semibold">
      <Timer className="size-4" />
      {remainingMs > 0 ? parts.join(" ") : "Oferta encerrada"}
    </p>
  );
}

function OfferListBlock({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof Gift;
  items: Array<{
    description?: string;
    id: string;
    meta?: string;
    title: string;
  }>;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/75 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-accent" />
        {title}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div className="min-w-0 rounded-md bg-secondary/45 p-3" key={item.id}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="break-words text-sm font-medium">{item.title}</p>
              {item.meta ? (
                <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  {item.meta}
                </span>
              ) : null}
            </div>
            {item.description ? (
              <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
