"use client";

import { useState } from "react";
import { Loader2, Moon, Save, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CHECKOUT_BADGE_DEFAULTS,
  normalizeCheckoutBadges,
  type CheckoutBadge,
} from "@/modules/checkout/domain/badges";
import { isValidHexColor } from "@/modules/checkout/domain/color";
import type {
  CheckoutOffer,
  CheckoutProduct,
  CheckoutTheme,
} from "@/modules/checkout/domain/types";
import {
  updateCheckoutPersonalizationAction,
  type CheckoutActionResult,
} from "@/modules/checkout/presentation/actions";
import type { Product } from "@/modules/products/domain/types";
import { cn } from "@/shared/utils/cn";

import { CheckoutOrderBumpPanel } from "./checkout-order-bump-panel";
import { CheckoutTemplate } from "./checkout-template";

const DEFAULT_PRIMARY_COLOR = "#19cd8b";

type EditorTab = "orderBumps" | "personalization";

const EDITOR_TABS: Array<{ label: string; value: EditorTab }> = [
  { label: "Personalização", value: "personalization" },
  { label: "Order bump", value: "orderBumps" },
];

type CheckoutEditorClientProps = {
  checkoutId: string;
  checkoutSlug: string;
  initialBadges: CheckoutBadge[];
  initialDescription: string | null;
  initialHeadline: string | null;
  initialOffers: CheckoutOffer[];
  initialPrimaryColor: string | null;
  initialTheme: CheckoutTheme;
  producerProducts: Product[];
  product: CheckoutProduct;
  productId: string;
};

export function CheckoutEditorClient({
  checkoutId,
  checkoutSlug,
  initialBadges,
  initialDescription,
  initialHeadline,
  initialOffers,
  initialPrimaryColor,
  initialTheme,
  producerProducts,
  product,
  productId,
}: CheckoutEditorClientProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("personalization");
  const [headline, setHeadline] = useState(initialHeadline ?? product.name);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    initialPrimaryColor && isValidHexColor(initialPrimaryColor)
      ? initialPrimaryColor
      : DEFAULT_PRIMARY_COLOR,
  );
  const [theme, setTheme] = useState<CheckoutTheme>(initialTheme);
  const [badges, setBadges] = useState<CheckoutBadge[]>(
    normalizeCheckoutBadges(initialBadges),
  );
  const [offers, setOffers] = useState<CheckoutOffer[]>(initialOffers);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<CheckoutActionResult | null>(null);

  function updateBadge(id: CheckoutBadge["id"], patch: Partial<CheckoutBadge>) {
    setBadges((current) =>
      current.map((badge) =>
        badge.id === id ? { ...badge, ...patch } : badge,
      ),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setResult(null);

    const actionResult = await updateCheckoutPersonalizationAction(
      checkoutId,
      productId,
      {
        badges,
        description,
        headline,
        primaryColor,
        theme,
      },
    );

    setResult(actionResult);
    setIsSaving(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-clip lg:flex-row">
      <div className="min-w-0 flex-1 overflow-x-clip overflow-y-auto bg-muted/20">
        <CheckoutTemplate
          badges={badges}
          description={description}
          headline={headline}
          key={theme}
          orderBumps={offers}
          primaryColor={primaryColor}
          product={product}
          theme={theme}
          variant="preview"
        />
      </div>

      <aside className="min-w-0 w-full shrink-0 overflow-y-auto border-t border-border bg-card lg:w-96 lg:border-l lg:border-t-0">
        <Card className="rounded-none border-0 shadow-none">
          <CardHeader className="gap-3">
            <div>
              <CardTitle className="text-base">
                {activeTab === "personalization"
                  ? "Personalização"
                  : "Order bump"}
              </CardTitle>
              <CardDescription className="max-w-full break-words">
                {activeTab === "personalization"
                  ? "Ajuste os detalhes que os compradores veem nesta página."
                  : "Ofereça produtos adicionais no momento da compra."}
              </CardDescription>
            </div>
            <div className="flex gap-1 border-b border-border" role="tablist">
              {EDITOR_TABS.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                  <button
                    aria-selected={isActive}
                    className={cn(
                      "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-accent text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    role="tab"
                    type="button"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="flex min-w-0 flex-col gap-5">
            {activeTab === "orderBumps" ? (
              <CheckoutOrderBumpPanel
                checkoutId={checkoutId}
                checkoutSlug={checkoutSlug}
                initialOffers={offers}
                onOffersChange={setOffers}
                producerProducts={producerProducts}
                productId={productId}
              />
            ) : (
              <>
            <div className="space-y-2">
              <Label htmlFor="checkout-headline">Título</Label>
              <Input
                id="checkout-headline"
                className="max-w-full"
                maxLength={120}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder={product.name}
                value={headline}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="checkout-description">Descrição</Label>
                <span className="text-xs text-muted-foreground">
                  {description.length}/280
                </span>
              </div>
              <textarea
                className="min-h-24 w-full max-w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="checkout-description"
                maxLength={280}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Um resumo curto que aparece para o comprador."
                value={description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout-primary-color">Cor de destaque</Label>
              <div className="flex items-center gap-3">
                <input
                  className="h-9 w-14 shrink-0 cursor-pointer rounded-md border border-input bg-background/80"
                  id="checkout-primary-color"
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  type="color"
                  value={
                    isValidHexColor(primaryColor)
                      ? primaryColor
                      : DEFAULT_PRIMARY_COLOR
                  }
                />
                <Input
                  className="min-w-0 flex-1 uppercase"
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  placeholder={DEFAULT_PRIMARY_COLOR}
                  value={primaryColor}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tema padrão</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={cn(
                    "flex min-w-0 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    theme === "dark"
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setTheme("dark")}
                  type="button"
                >
                  <Moon className="size-4" />
                  Escuro
                </button>
                <button
                  className={cn(
                    "flex min-w-0 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    theme === "light"
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setTheme("light")}
                  type="button"
                >
                  <Sun className="size-4" />
                  Claro
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                O comprador pode alternar o tema ao entrar na página.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Selos de confiança</Label>
              {badges.map((badge) => (
                <div
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border p-2"
                  key={badge.id}
                >
                  <button
                    aria-pressed={badge.enabled}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                      badge.enabled
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-muted-foreground",
                    )}
                    onClick={() =>
                      updateBadge(badge.id, { enabled: !badge.enabled })
                    }
                    type="button"
                  >
                    {badge.enabled ? "On" : "Off"}
                  </button>
                  <Input
                    className="h-8 min-w-0 flex-1"
                    disabled={!badge.enabled}
                    maxLength={60}
                    onChange={(event) =>
                      updateBadge(badge.id, { label: event.target.value })
                    }
                    placeholder={CHECKOUT_BADGE_DEFAULTS[badge.id]}
                    value={badge.label}
                  />
                </div>
              ))}
            </div>

            {result ? (
              <p
                className={cn(
                  "text-sm",
                  result.status === "success"
                    ? "text-success"
                    : "text-destructive",
                )}
                role={result.status === "success" ? "status" : "alert"}
              >
                {result.message}
              </p>
            ) : null}

            <Button disabled={isSaving} onClick={handleSave} type="button">
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar alterações
            </Button>
              </>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
