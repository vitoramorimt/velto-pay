"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Gift,
  HelpCircle,
  ImageIcon,
  Loader2,
  Package,
  Paintbrush,
  Plus,
  QrCode,
  Quote,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHECKOUT_BADGE_DEFAULTS,
  type CheckoutBadge,
} from "@/modules/checkout/domain/badges";
import type {
  CheckoutLink,
  CheckoutProduct,
} from "@/modules/checkout/domain/types";
import { CheckoutTemplate } from "@/modules/checkout/presentation/components/checkout-template";
import {
  formatCentsToCurrency,
  maskPriceInputFromDigits,
  parseProductPriceToCents,
} from "@/modules/products/domain/money";
import {
  PRODUCT_STATUS_LABELS,
  type EditableProductStatus,
} from "@/modules/products/domain/types";
import { calculateOfferQuality } from "@/modules/offers/domain/quality";
import type {
  OfferCenterSaveInput,
  OfferCheckoutDraft,
  OfferConversionContent,
  OfferPaymentSimulation,
  OfferProductDraft,
} from "@/modules/offers/domain/types";
import {
  saveOfferCenterAction,
  type OfferCenterActionResult,
} from "@/modules/offers/presentation/actions";
import { cn } from "@/shared/utils/cn";

const DEFAULT_PRIMARY_COLOR = "#19cd8b";

type OfferCreationCenterProps = {
  checkout: CheckoutLink;
  conversion: OfferConversionContent;
  paymentSimulation: OfferPaymentSimulation;
  product: OfferProductDraft;
  productId: string;
  publicLink: string;
};

type StepId = "product" | "checkout" | "conversion" | "payment" | "publish";
type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

const steps: Array<{
  description: string;
  icon: typeof Package;
  id: StepId;
  label: string;
}> = [
  {
    description: "Base comercial",
    icon: Package,
    id: "product",
    label: "Produto",
  },
  {
    description: "Aparência",
    icon: Paintbrush,
    id: "checkout",
    label: "Checkout",
  },
  {
    description: "Argumentos",
    icon: TrendingUp,
    id: "conversion",
    label: "Conversão",
  },
  {
    description: "Simulação",
    icon: CreditCard,
    id: "payment",
    label: "Pagamento",
  },
  {
    description: "Distribuição",
    icon: Send,
    id: "publish",
    label: "Publicar",
  },
];

const categoryOptions = [
  "Educação",
  "Comunidade",
  "Consultoria",
  "Templates",
  "Eventos",
  "Software",
  "Serviços",
];

function createClientId(prefix: string): string {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function toPreviewProduct(
  baseProduct: CheckoutProduct,
  draft: OfferProductDraft,
): CheckoutProduct {
  return {
    ...baseProduct,
    category: trimOrNull(draft.category),
    description: trimOrNull(draft.description),
    image_url: trimOrNull(draft.imageUrl),
    name: draft.name.trim() || baseProduct.name,
    price_cents:
      parseProductPriceToCents(draft.price) ?? baseProduct.price_cents,
    status: draft.status,
  };
}

function buildInitialCheckoutDraft(
  checkout: CheckoutLink,
  product: OfferProductDraft,
): OfferCheckoutDraft {
  return {
    badges: checkout.checkoutBadges,
    bannerUrl: checkout.checkoutBannerUrl ?? "",
    description: checkout.checkoutDescription ?? product.description,
    headline: checkout.checkoutHeadline ?? product.name,
    logoUrl: checkout.checkoutLogoUrl ?? "",
    primaryColor: checkout.checkoutPrimaryColor ?? DEFAULT_PRIMARY_COLOR,
    securePurchaseEnabled: checkout.checkoutSecurePurchaseEnabled,
    theme: checkout.checkoutTheme,
  };
}

function formatSavedAt(value: Date | null): string {
  if (!value) {
    return "Salvo automaticamente";
  }

  return `Salvo às ${value.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function OfferCreationCenter({
  checkout,
  conversion: initialConversion,
  paymentSimulation,
  product: initialProduct,
  productId,
  publicLink,
}: OfferCreationCenterProps) {
  const [activeStep, setActiveStep] = useState<StepId>("product");
  const [product, setProduct] = useState<OfferProductDraft>(initialProduct);
  const [checkoutDraft, setCheckoutDraft] = useState<OfferCheckoutDraft>(() =>
    buildInitialCheckoutDraft(checkout, initialProduct),
  );
  const [conversion, setConversion] =
    useState<OfferConversionContent>(initialConversion);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveResult, setSaveResult] = useState<OfferCenterActionResult | null>(
    null,
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const hasMountedRef = useRef(false);
  const saveVersionRef = useRef(0);
  const previewProduct = useMemo(
    () => toPreviewProduct(checkout.product, product),
    [checkout.product, product],
  );
  const quality = useMemo(
    () =>
      calculateOfferQuality({
        checkoutStatus: checkout.checkoutStatus,
        conversion,
        product,
      }),
    [checkout.checkoutStatus, conversion, product],
  );
  const savePayload = useMemo<OfferCenterSaveInput>(
    () => ({
      checkout: checkoutDraft,
      conversion,
      product,
    }),
    [checkoutDraft, conversion, product],
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const version = saveVersionRef.current + 1;
    saveVersionRef.current = version;
    setSaveState("pending");
    setSaveResult(null);

    const timeout = window.setTimeout(async () => {
      setSaveState("saving");
      const result = await saveOfferCenterAction(productId, savePayload);

      if (saveVersionRef.current !== version) {
        return;
      }

      setSaveResult(result);

      if (result.status === "success") {
        setSaveState("saved");
        setLastSavedAt(new Date());
        return;
      }

      setSaveState("error");
    }, 850);

    return () => window.clearTimeout(timeout);
  }, [productId, savePayload]);

  function updateProduct(patch: Partial<OfferProductDraft>) {
    setProduct((current) => ({ ...current, ...patch }));
  }

  function updateCheckout(patch: Partial<OfferCheckoutDraft>) {
    setCheckoutDraft((current) => ({ ...current, ...patch }));
  }

  async function copyPublicLink() {
    await navigator.clipboard.writeText(publicLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const activeStepIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(21rem,0.72fr)]">
      <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <OfferQualityPanel quality={quality} />
      </aside>

      <section className="min-w-0 overflow-hidden rounded-lg border border-border/80 bg-card/90 shadow-soft">
        <div className="border-b border-border/80 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Badge
                className="border-accent/25 bg-accent/10 text-accent"
                variant="outline"
              >
                <Sparkles className="mr-1 size-3" />
                Centro de criação
              </Badge>
              <h2 className="mt-3 break-words text-xl font-semibold sm:text-2xl">
                Oferta completa em um único fluxo
              </h2>
            </div>
            <AutosaveStatus
              lastSavedAt={lastSavedAt}
              result={saveResult}
              state={saveState}
            />
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-5 gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === activeStep;
              const isComplete = index < activeStepIndex;

              return (
                <button
                  className={cn(
                    "group min-w-32 rounded-lg border p-3 text-left transition-all",
                    isActive
                      ? "border-accent/45 bg-accent/10 text-foreground shadow-sm"
                      : "border-border/80 bg-background/60 text-muted-foreground hover:border-accent/25 hover:text-foreground",
                  )}
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md border",
                        isActive || isComplete
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border bg-muted/50",
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <span className="text-sm font-semibold">
                      {index + 1} {step.label}
                    </span>
                  </span>
                  <span className="mt-2 block text-xs leading-5">
                    {step.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          {activeStep === "product" ? (
            <ProductStep product={product} updateProduct={updateProduct} />
          ) : null}

          {activeStep === "checkout" ? (
            <CheckoutStep
              checkout={checkoutDraft}
              updateCheckout={updateCheckout}
            />
          ) : null}

          {activeStep === "conversion" ? (
            <ConversionStep
              conversion={conversion}
              setConversion={setConversion}
            />
          ) : null}

          {activeStep === "payment" ? (
            <PaymentStep
              paymentSimulation={paymentSimulation}
              previewProduct={previewProduct}
            />
          ) : null}

          {activeStep === "publish" ? (
            <PublishStep
              checkoutStatus={checkout.checkoutStatus}
              copied={copied}
              onCopy={copyPublicLink}
              publicLink={publicLink}
            />
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <Button
            disabled={activeStepIndex === 0}
            onClick={() => setActiveStep(steps[activeStepIndex - 1].id)}
            type="button"
            variant="outline"
          >
            Voltar
          </Button>
          <Button
            disabled={activeStepIndex === steps.length - 1}
            onClick={() => setActiveStep(steps[activeStepIndex + 1].id)}
            type="button"
          >
            Continuar
          </Button>
        </div>
      </section>

      <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Preview ao vivo</p>
              <p className="text-xs text-muted-foreground">
                Mesma experiência do comprador
              </p>
            </div>
            <Badge variant="secondary">Live</Badge>
          </div>
          <div className="max-h-[780px] min-w-0 overflow-y-auto bg-background">
            <CheckoutTemplate
              badges={checkoutDraft.badges}
              bannerUrl={checkoutDraft.bannerUrl}
              description={checkoutDraft.description}
              headline={checkoutDraft.headline}
              logoUrl={checkoutDraft.logoUrl}
              offerContent={conversion}
              primaryColor={checkoutDraft.primaryColor}
              product={previewProduct}
              securePurchaseEnabled={checkoutDraft.securePurchaseEnabled}
              theme={checkoutDraft.theme}
              variant="preview"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function AutosaveStatus({
  lastSavedAt,
  result,
  state,
}: {
  lastSavedAt: Date | null;
  result: OfferCenterActionResult | null;
  state: SaveState;
}) {
  const isSaving = state === "pending" || state === "saving";
  const isError = state === "error";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        isError
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-border bg-background/70 text-muted-foreground",
      )}
    >
      {isSaving ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
      ) : isError ? (
        <AlertCircle className="size-4 shrink-0" />
      ) : (
        <Save className="size-4 shrink-0 text-accent" />
      )}
      <span className="min-w-0 break-words">
        {isError
          ? (result?.message ?? "Erro ao salvar")
          : isSaving
            ? "Salvando..."
            : formatSavedAt(lastSavedAt)}
      </span>
    </div>
  );
}

function OfferQualityPanel({
  quality,
}: {
  quality: ReturnType<typeof calculateOfferQuality>;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-card/90 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Oferta</p>
          <p className="text-xs text-muted-foreground">Qualidade comercial</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-accent">
            {quality.score}%
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${quality.score}%` }}
        />
      </div>
      <div className="mt-4 grid gap-2">
        {quality.items.map((item) => (
          <div
            className="flex min-w-0 items-center justify-between gap-3 text-sm"
            key={item.id}
          >
            <span className="min-w-0 break-words text-muted-foreground">
              {item.label}
            </span>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border",
                item.complete
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {item.complete ? (
                <Check className="size-3.5" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
          </div>
        ))}
      </div>
      {quality.suggestions.length > 0 ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Sugestões
          </p>
          <ul className="mt-3 grid gap-2">
            {quality.suggestions.map((suggestion) => (
              <li
                className="rounded-md bg-muted/55 px-3 py-2 text-xs leading-5 text-muted-foreground"
                key={suggestion}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ProductStep({
  product,
  updateProduct,
}: {
  product: OfferProductDraft;
  updateProduct: (patch: Partial<OfferProductDraft>) => void;
}) {
  const priceFieldValue = product.price;

  return (
    <div className="grid gap-5">
      <StepHeader
        description="Defina a base da oferta que será apresentada no checkout."
        icon={Package}
        title="Produto"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="grid min-w-0 gap-4">
          <FieldGroup>
            <Label htmlFor="offer-product-name">Nome</Label>
            <Input
              id="offer-product-name"
              maxLength={140}
              onChange={(event) => updateProduct({ name: event.target.value })}
              placeholder="Mentoria Performance Criativa"
              value={product.name}
            />
          </FieldGroup>

          <FieldGroup>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="offer-product-description">Descrição</Label>
              <span className="text-xs text-muted-foreground">
                {product.description.length}/500
              </span>
            </div>
            <textarea
              className="min-h-28 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="offer-product-description"
              maxLength={500}
              onChange={(event) =>
                updateProduct({ description: event.target.value })
              }
              placeholder="Resumo direto do resultado, conteúdo e entrega."
              value={product.description}
            />
          </FieldGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="offer-product-category">Categoria</Label>
              <Select
                onValueChange={(value) => updateProduct({ category: value })}
                value={product.category || undefined}
              >
                <SelectTrigger id="offer-product-category">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="offer-product-status">Status</Label>
              <Select
                onValueChange={(value) =>
                  updateProduct({ status: value as EditableProductStatus })
                }
                value={product.status}
              >
                <SelectTrigger id="offer-product-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(
                    ([status, label]) => (
                      <SelectItem key={status} value={status}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="offer-product-price">Preço</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  className="pl-9"
                  id="offer-product-price"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateProduct({
                      price: maskPriceInputFromDigits(event.target.value),
                    })
                  }
                  placeholder="0,00"
                  value={priceFieldValue}
                />
              </div>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="offer-product-image">Imagem</Label>
              <Input
                id="offer-product-image"
                onChange={(event) =>
                  updateProduct({ imageUrl: event.target.value })
                }
                placeholder="https://cdn.sua-marca.com/oferta.jpg"
                type="url"
                value={product.imageUrl}
              />
            </FieldGroup>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-border/80 bg-background/70 p-4">
          <p className="text-sm font-semibold">Resumo</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
            {product.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                alt=""
                className="aspect-[4/3] w-full object-cover"
                decoding="async"
                src={product.imageUrl}
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>
            )}
            <div className="p-4">
              <p className="break-words text-sm font-semibold">
                {product.name || "Nome da oferta"}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                {product.description || "Descrição resumida da entrega."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {product.category ? (
                  <Badge variant="secondary">{product.category}</Badge>
                ) : null}
                <Badge variant="outline">
                  {PRODUCT_STATUS_LABELS[product.status]}
                </Badge>
              </div>
              <p className="mt-4 text-lg font-semibold text-accent">
                {formatCentsToCurrency(
                  parseProductPriceToCents(product.price) ?? 0,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutStep({
  checkout,
  updateCheckout,
}: {
  checkout: OfferCheckoutDraft;
  updateCheckout: (patch: Partial<OfferCheckoutDraft>) => void;
}) {
  function updateBadge(id: CheckoutBadge["id"], patch: Partial<CheckoutBadge>) {
    updateCheckout({
      badges: checkout.badges.map((badge) =>
        badge.id === id ? { ...badge, ...patch } : badge,
      ),
    });
  }

  return (
    <div className="grid gap-5">
      <StepHeader
        description="Controle a aparência do checkout que o comprador verá."
        icon={Paintbrush}
        title="Checkout"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="offer-checkout-headline">Nome exibido</Label>
          <Input
            id="offer-checkout-headline"
            maxLength={120}
            onChange={(event) =>
              updateCheckout({ headline: event.target.value })
            }
            value={checkout.headline}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Tema</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((theme) => (
              <button
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  checkout.theme === theme
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-background text-muted-foreground",
                )}
                key={theme}
                onClick={() => updateCheckout({ theme })}
                type="button"
              >
                {theme === "dark" ? "Escuro" : "Claro"}
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>

      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="offer-checkout-description">Descrição</Label>
          <span className="text-xs text-muted-foreground">
            {checkout.description.length}/280
          </span>
        </div>
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="offer-checkout-description"
          maxLength={280}
          onChange={(event) =>
            updateCheckout({ description: event.target.value })
          }
          value={checkout.description}
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="offer-checkout-color">Cor principal</Label>
          <div className="flex min-w-0 items-center gap-3">
            <input
              className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-input bg-background"
              id="offer-checkout-color"
              onChange={(event) =>
                updateCheckout({ primaryColor: event.target.value })
              }
              type="color"
              value={checkout.primaryColor || DEFAULT_PRIMARY_COLOR}
            />
            <Input
              className="min-w-0 uppercase"
              onChange={(event) =>
                updateCheckout({ primaryColor: event.target.value })
              }
              value={checkout.primaryColor}
            />
          </div>
        </FieldGroup>

        <FieldGroup>
          <Label>Compra segura</Label>
          <button
            aria-pressed={checkout.securePurchaseEnabled}
            className={cn(
              "flex h-10 items-center justify-between rounded-md border px-3 text-sm font-medium transition-colors",
              checkout.securePurchaseEnabled
                ? "border-accent/35 bg-accent/10 text-accent"
                : "border-border bg-background text-muted-foreground",
            )}
            onClick={() =>
              updateCheckout({
                securePurchaseEnabled: !checkout.securePurchaseEnabled,
              })
            }
            type="button"
          >
            <span>Compra segura</span>
            <ShieldCheck className="size-4" />
          </button>
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="offer-checkout-logo">Logo</Label>
          <Input
            id="offer-checkout-logo"
            onChange={(event) => updateCheckout({ logoUrl: event.target.value })}
            placeholder="https://cdn.sua-marca.com/logo.png"
            type="url"
            value={checkout.logoUrl}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="offer-checkout-banner">Banner</Label>
          <Input
            id="offer-checkout-banner"
            onChange={(event) =>
              updateCheckout({ bannerUrl: event.target.value })
            }
            placeholder="https://cdn.sua-marca.com/banner.jpg"
            type="url"
            value={checkout.bannerUrl}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-semibold">Badges</p>
        <div className="grid gap-2">
          {checkout.badges.map((badge) => (
            <div
              className="grid min-w-0 gap-2 rounded-lg border border-border/80 bg-background/70 p-3 sm:grid-cols-[5rem_minmax(0,1fr)]"
              key={badge.id}
            >
              <button
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                  badge.enabled
                    ? "border-accent/35 bg-accent/10 text-accent"
                    : "border-border text-muted-foreground",
                )}
                onClick={() => updateBadge(badge.id, { enabled: !badge.enabled })}
                type="button"
              >
                {badge.enabled ? "Ativo" : "Inativo"}
              </button>
              <Input
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
      </div>
    </div>
  );
}

function ConversionStep({
  conversion,
  setConversion,
}: {
  conversion: OfferConversionContent;
  setConversion: Dispatch<SetStateAction<OfferConversionContent>>;
}) {
  return (
    <div className="grid gap-5">
      <StepHeader
        description="Construa a percepção de valor antes do comprador pagar."
        icon={TrendingUp}
        title="Conversão"
      />

      <EditableTextList
        icon={CheckCircle2}
        items={conversion.benefits}
        label="Benefícios"
        onAdd={() =>
          setConversion((current) => ({
            ...current,
            benefits: [
              ...current.benefits,
              { id: createClientId("benefit"), text: "" },
            ],
          }))
        }
        onChange={(id, text) =>
          setConversion((current) => ({
            ...current,
            benefits: current.benefits.map((benefit) =>
              benefit.id === id ? { ...benefit, text } : benefit,
            ),
          }))
        }
        onRemove={(id) =>
          setConversion((current) => ({
            ...current,
            benefits: current.benefits.filter((benefit) => benefit.id !== id),
          }))
        }
        placeholder="Resultado claro que o comprador recebe"
      />

      <FieldGroup>
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-accent" />
          <Label htmlFor="offer-guarantee">Garantia</Label>
        </div>
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="offer-guarantee"
          maxLength={220}
          onChange={(event) =>
            setConversion((current) => ({
              ...current,
              guarantee: event.target.value,
            }))
          }
          placeholder="Garantia de 7 dias com reembolso simples."
          value={conversion.guarantee}
        />
      </FieldGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <FaqEditor conversion={conversion} setConversion={setConversion} />
        <TestimonialsEditor
          conversion={conversion}
          setConversion={setConversion}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BonusEditor conversion={conversion} setConversion={setConversion} />
        <TrustSealEditor
          conversion={conversion}
          setConversion={setConversion}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FieldGroup>
          <div className="flex items-center gap-2">
            <Timer className="size-4 text-accent" />
            <Label>Contador de oferta</Label>
          </div>
          <button
            className={cn(
              "flex h-10 items-center justify-between rounded-md border px-3 text-sm font-medium transition-colors",
              conversion.countdownEnabled
                ? "border-accent/35 bg-accent/10 text-accent"
                : "border-border bg-background text-muted-foreground",
            )}
            onClick={() =>
              setConversion((current) => ({
                ...current,
                countdownEnabled: !current.countdownEnabled,
              }))
            }
            type="button"
          >
            <span>{conversion.countdownEnabled ? "Ativo" : "Inativo"}</span>
            <Timer className="size-4" />
          </button>
          <Input
            disabled={!conversion.countdownEnabled}
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                countdownEndsAt: event.target.value,
              }))
            }
            type="datetime-local"
            value={conversion.countdownEndsAt.slice(0, 16)}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="offer-urgency">Texto de urgência</Label>
          <Input
            id="offer-urgency"
            maxLength={160}
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                urgencyText: event.target.value,
              }))
            }
            placeholder="Condição especial disponível por tempo limitado."
            value={conversion.urgencyText}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

function PaymentStep({
  paymentSimulation,
  previewProduct,
}: {
  paymentSimulation: OfferPaymentSimulation;
  previewProduct: CheckoutProduct;
}) {
  const currentPriceCents = previewProduct.price_cents;
  const veltoFeeCents =
    paymentSimulation.fixedFeeCents +
    Math.round(currentPriceCents * (paymentSimulation.percentage / 100));
  const clientPaysCents = currentPriceCents + veltoFeeCents;

  return (
    <div className="grid gap-5">
      <StepHeader
        description="Veja a composição financeira exibida para apoiar a publicação."
        icon={CreditCard}
        title="Pagamento"
      />

      <div className="rounded-lg border border-border/80 bg-background/70 p-4 sm:p-5">
        <div className="grid gap-3">
          <SimulationRow
            label="Preço"
            value={formatCentsToCurrency(currentPriceCents)}
          />
          <SimulationRow
            label="Cliente paga"
            value={formatCentsToCurrency(clientPaysCents)}
          />
          <SimulationRow
            label="Taxa Velto"
            value={formatCentsToCurrency(veltoFeeCents)}
          />
          <div className="border-t border-border pt-3">
            <SimulationRow
              highlight
              label="Você recebe"
              value={formatCentsToCurrency(currentPriceCents)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PublishStep({
  checkoutStatus,
  copied,
  onCopy,
  publicLink,
}: {
  checkoutStatus: CheckoutLink["checkoutStatus"];
  copied: boolean;
  onCopy: () => void;
  publicLink: string;
}) {
  const statusLabel = {
    disabled: "Desativado",
    draft: "Rascunho",
    published: "Publicado",
  }[checkoutStatus];
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    publicLink,
  )}`;

  return (
    <div className="grid gap-5">
      <StepHeader
        description="Copie o link e distribua a oferta nos seus canais."
        icon={Send}
        title="Publicar"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="min-w-0 rounded-lg border border-border/80 bg-background/70 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                checkoutStatus === "published"
                  ? "border-success/25 bg-success/10 text-success"
                  : "border-warning/25 bg-warning/10 text-warning",
              )}
              variant="outline"
            >
              {statusLabel}
            </Badge>
            <Badge variant="secondary">Checkout</Badge>
          </div>

          <div className="mt-4 min-w-0 rounded-lg border border-border bg-card p-3">
            <p className="break-all text-sm font-medium">{publicLink}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={onCopy} type="button">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button asChild className="w-full sm:w-auto" variant="outline">
              <Link href={publicLink} target="_blank">
                <ExternalLink className="size-4" />
                Visualizar
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Compartilhe este link no Instagram, Facebook Ads, TikTok Ads, Google
            Ads, WhatsApp, Telegram ou UTMify.
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center rounded-lg border border-border/80 bg-card p-4 text-center">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <QrCode className="size-4 text-accent" />
            QR Code
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="QR Code do checkout"
            className="size-44 rounded-md border border-border bg-white p-2"
            decoding="async"
            loading="lazy"
            referrerPolicy="no-referrer"
            src={qrCodeUrl}
          />
        </div>
      </div>
    </div>
  );
}

function FaqEditor({
  conversion,
  setConversion,
}: {
  conversion: OfferConversionContent;
  setConversion: Dispatch<SetStateAction<OfferConversionContent>>;
}) {
  return (
    <StructuredList
      icon={HelpCircle}
      label="FAQ"
      onAdd={() =>
        setConversion((current) => ({
          ...current,
          faqs: [
            ...current.faqs,
            { answer: "", id: createClientId("faq"), question: "" },
          ],
        }))
      }
    >
      {conversion.faqs.map((faq) => (
        <StructuredListItem
          key={faq.id}
          onRemove={() =>
            setConversion((current) => ({
              ...current,
              faqs: current.faqs.filter((item) => item.id !== faq.id),
            }))
          }
        >
          <Input
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                faqs: updateById(current.faqs, faq.id, {
                  question: event.target.value,
                }),
              }))
            }
            placeholder="Pergunta"
            value={faq.question}
          />
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                faqs: updateById(current.faqs, faq.id, {
                  answer: event.target.value,
                }),
              }))
            }
            placeholder="Resposta"
            value={faq.answer}
          />
        </StructuredListItem>
      ))}
    </StructuredList>
  );
}

function TestimonialsEditor({
  conversion,
  setConversion,
}: {
  conversion: OfferConversionContent;
  setConversion: Dispatch<SetStateAction<OfferConversionContent>>;
}) {
  return (
    <StructuredList
      icon={Quote}
      label="Depoimentos"
      onAdd={() =>
        setConversion((current) => ({
          ...current,
          testimonials: [
            ...current.testimonials,
            {
              id: createClientId("testimonial"),
              name: "",
              quote: "",
              role: "",
            },
          ],
        }))
      }
    >
      {conversion.testimonials.map((testimonial) => (
        <StructuredListItem
          key={testimonial.id}
          onRemove={() =>
            setConversion((current) => ({
              ...current,
              testimonials: current.testimonials.filter(
                (item) => item.id !== testimonial.id,
              ),
            }))
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              onChange={(event) =>
                setConversion((current) => ({
                  ...current,
                  testimonials: updateById(
                    current.testimonials,
                    testimonial.id,
                    { name: event.target.value },
                  ),
                }))
              }
              placeholder="Nome"
              value={testimonial.name}
            />
            <Input
              onChange={(event) =>
                setConversion((current) => ({
                  ...current,
                  testimonials: updateById(
                    current.testimonials,
                    testimonial.id,
                    { role: event.target.value },
                  ),
                }))
              }
              placeholder="Contexto"
              value={testimonial.role}
            />
          </div>
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                testimonials: updateById(
                  current.testimonials,
                  testimonial.id,
                  { quote: event.target.value },
                ),
              }))
            }
            placeholder="Depoimento"
            value={testimonial.quote}
          />
        </StructuredListItem>
      ))}
    </StructuredList>
  );
}

function BonusEditor({
  conversion,
  setConversion,
}: {
  conversion: OfferConversionContent;
  setConversion: Dispatch<SetStateAction<OfferConversionContent>>;
}) {
  return (
    <StructuredList
      icon={Gift}
      label="Lista de bônus"
      onAdd={() =>
        setConversion((current) => ({
          ...current,
          bonuses: [
            ...current.bonuses,
            {
              description: "",
              id: createClientId("bonus"),
              title: "",
              value: "",
            },
          ],
        }))
      }
    >
      {conversion.bonuses.map((bonus) => (
        <StructuredListItem
          key={bonus.id}
          onRemove={() =>
            setConversion((current) => ({
              ...current,
              bonuses: current.bonuses.filter((item) => item.id !== bonus.id),
            }))
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              onChange={(event) =>
                setConversion((current) => ({
                  ...current,
                  bonuses: updateById(current.bonuses, bonus.id, {
                    title: event.target.value,
                  }),
                }))
              }
              placeholder="Bônus"
              value={bonus.title}
            />
            <Input
              onChange={(event) =>
                setConversion((current) => ({
                  ...current,
                  bonuses: updateById(current.bonuses, bonus.id, {
                    value: event.target.value,
                  }),
                }))
              }
              placeholder="Valor"
              value={bonus.value}
            />
          </div>
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                bonuses: updateById(current.bonuses, bonus.id, {
                  description: event.target.value,
                }),
              }))
            }
            placeholder="Descrição"
            value={bonus.description}
          />
        </StructuredListItem>
      ))}
    </StructuredList>
  );
}

function TrustSealEditor({
  conversion,
  setConversion,
}: {
  conversion: OfferConversionContent;
  setConversion: Dispatch<SetStateAction<OfferConversionContent>>;
}) {
  return (
    <EditableTextList
      icon={ShieldCheck}
      items={conversion.trustSeals}
      label="Selos de confiança"
      onAdd={() =>
        setConversion((current) => ({
          ...current,
          trustSeals: [
            ...current.trustSeals,
            { id: createClientId("trust"), label: "" },
          ],
        }))
      }
      onChange={(id, label) =>
        setConversion((current) => ({
          ...current,
          trustSeals: current.trustSeals.map((seal) =>
            seal.id === id ? { ...seal, label } : seal,
          ),
        }))
      }
      onRemove={(id) =>
        setConversion((current) => ({
          ...current,
          trustSeals: current.trustSeals.filter((seal) => seal.id !== id),
        }))
      }
      placeholder="Ambiente seguro"
    />
  );
}

function EditableTextList<TItem extends { id: string }>({
  icon: Icon,
  items,
  label,
  onAdd,
  onChange,
  onRemove,
  placeholder,
}: {
  icon: typeof CheckCircle2;
  items: TItem[];
  label: string;
  onAdd: () => void;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  placeholder: string;
}) {
  return (
    <StructuredList icon={Icon} label={label} onAdd={onAdd}>
      {items.map((item) => {
        const value =
          "text" in item
            ? String(item.text)
            : "label" in item
              ? String(item.label)
              : "";

        return (
          <div className="flex min-w-0 gap-2" key={item.id}>
            <Input
              onChange={(event) => onChange(item.id, event.target.value)}
              placeholder={placeholder}
              value={value}
            />
            <IconButton
              label="Remover"
              onClick={() => onRemove(item.id)}
              variant="danger"
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        );
      })}
    </StructuredList>
  );
}

function StructuredList({
  children,
  icon: Icon,
  label,
  onAdd,
}: {
  children: ReactNode;
  icon: typeof CheckCircle2;
  label: string;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-background/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-accent" />
          {label}
        </div>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  );
}

function StructuredListItem({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-border bg-card p-3">
      <div className="flex justify-end">
        <IconButton label="Remover" onClick={onRemove} variant="danger">
          <Trash2 className="size-4" />
        </IconButton>
      </div>
      {children}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "danger" | "default";
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors",
        variant === "danger"
          ? "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-2">{children}</div>;
}

function StepHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: typeof Package;
  title: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function SimulationRow({
  highlight = false,
  label,
  value,
}: {
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <span
        className={cn(
          "text-sm",
          highlight ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-right font-semibold",
          highlight ? "text-xl text-accent" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function updateById<TItem extends { id: string }>(
  items: TItem[],
  id: string,
  patch: Partial<TItem>,
): TItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}
