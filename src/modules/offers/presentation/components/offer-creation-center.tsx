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
  Link2,
  Loader2,
  Moon,
  Package,
  Paintbrush,
  Plus,
  QrCode,
  Quote,
  Save,
  Send,
  ShieldCheck,
  Sun,
  Timer,
  Trash2,
  TrendingUp,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CHECKOUT_BADGE_DEFAULTS,
  type CheckoutBadge,
} from "@/modules/checkout/domain/badges";
import type {
  CheckoutLink,
  CheckoutProduct,
} from "@/modules/checkout/domain/types";
import { CheckoutTemplate } from "@/modules/checkout/presentation/components/checkout-template";
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
import {
  formatCentsToCurrency,
  maskPriceInputFromDigits,
  parseProductPriceToCents,
} from "@/modules/products/domain/money";
import {
  PRODUCT_STATUS_LABELS,
  type EditableProductStatus,
} from "@/modules/products/domain/types";
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

type OfferTab =
  | "offer"
  | "appearance"
  | "conversion"
  | "payment"
  | "publication";
type SaveState = "idle" | "pending" | "saving" | "saved" | "error";
type Quality = ReturnType<typeof calculateOfferQuality>;

const tabs: Array<{ label: string; value: OfferTab }> = [
  { label: "Oferta", value: "offer" },
  { label: "Aparência", value: "appearance" },
  { label: "Conversão", value: "conversion" },
  { label: "Pagamento", value: "payment" },
  { label: "Publicação", value: "publication" },
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
    return "Último salvamento automático: salvo";
  }

  return `Último salvamento automático: ${value.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getCheckoutStatusFromProduct(
  status: EditableProductStatus,
): CheckoutLink["checkoutStatus"] {
  if (status === "active") {
    return "published";
  }

  return status === "draft" ? "draft" : "disabled";
}

function getCheckoutStatusLabel(status: CheckoutLink["checkoutStatus"]) {
  const labels = {
    disabled: "Despublicado",
    draft: "Rascunho",
    published: "Publicado",
  };

  return labels[status];
}

function getPublishRecommendations(quality: Quality): string[] {
  if (quality.suggestions.length > 0) {
    return quality.suggestions.slice(0, 4);
  }

  return [
    "Revise a oferta em mobile antes de enviar tráfego.",
    "Confirme se preço, promessa e garantia estão alinhados.",
  ];
}

export function OfferCreationCenter({
  checkout,
  conversion: initialConversion,
  paymentSimulation,
  product: initialProduct,
  productId,
  publicLink,
}: OfferCreationCenterProps) {
  const [activeTab, setActiveTab] = useState<OfferTab>("offer");
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const hasMountedRef = useRef(false);
  const saveVersionRef = useRef(0);
  const previewProduct = useMemo(
    () => toPreviewProduct(checkout.product, product),
    [checkout.product, product],
  );
  const checkoutStatus = getCheckoutStatusFromProduct(product.status);
  const quality = useMemo(
    () =>
      calculateOfferQuality({
        checkoutStatus,
        conversion,
        product,
      }),
    [checkoutStatus, conversion, product],
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

  async function persistImmediately(payload: OfferCenterSaveInput) {
    const version = saveVersionRef.current + 1;
    saveVersionRef.current = version;
    setSaveResult(null);
    setSaveState("saving");

    const result = await saveOfferCenterAction(productId, payload);

    if (saveVersionRef.current !== version) {
      return result;
    }

    setSaveResult(result);

    if (result.status === "success") {
      setSaveState("saved");
      setLastSavedAt(new Date());
    } else {
      setSaveState("error");
    }

    return result;
  }

  async function setOfferStatus(status: EditableProductStatus) {
    const nextProduct = { ...product, status };
    setProduct(nextProduct);

    return persistImmediately({
      ...savePayload,
      product: nextProduct,
    });
  }

  function applyAiImprovements() {
    const fallbackName = product.name.trim() || "sua oferta";

    if (!checkoutDraft.description.trim()) {
      updateCheckout({
        description:
          product.description.trim() ||
          `Acesse ${fallbackName} com uma experiência de compra simples e segura.`,
      });
    }

    setConversion((current) => {
      const hasBenefits = current.benefits.some((benefit) =>
        benefit.text.trim(),
      );
      const hasFaqs = current.faqs.some(
        (faq) => faq.question.trim() || faq.answer.trim(),
      );
      const hasBonuses = current.bonuses.some(
        (bonus) => bonus.title.trim() || bonus.description.trim(),
      );

      return {
        ...current,
        benefits: hasBenefits
          ? current.benefits
          : [
              {
                id: createClientId("benefit"),
                text: "Acesso imediato após a confirmação do pagamento.",
              },
              {
                id: createClientId("benefit"),
                text: "Conteúdo organizado para aplicar sem complexidade.",
              },
              {
                id: createClientId("benefit"),
                text: "Compra protegida em ambiente seguro.",
              },
            ],
        bonuses: hasBonuses
          ? current.bonuses
          : [
              {
                description: "Material complementar para acelerar a aplicação.",
                id: createClientId("bonus"),
                title: "Bônus de implementação",
                value: "",
              },
            ],
        faqs: hasFaqs
          ? current.faqs
          : [
              {
                answer:
                  "O acesso é enviado automaticamente após a confirmação.",
                id: createClientId("faq"),
                question: "Como recebo o acesso?",
              },
              {
                answer: "Sim. O pagamento é processado em ambiente seguro.",
                id: createClientId("faq"),
                question: "A compra é segura?",
              },
            ],
        guarantee: current.guarantee.trim()
          ? current.guarantee
          : "Garantia de 7 dias com reembolso simples.",
        urgencyText: current.urgencyText.trim()
          ? current.urgencyText
          : "Condição especial disponível por tempo limitado.",
      };
    });

    setActiveTab("conversion");
    setIsQualityOpen(false);
  }

  async function publishOffer() {
    setIsPublishing(true);
    const result = await setOfferStatus("active");
    setIsPublishing(false);

    if (result.status === "success") {
      setIsQualityOpen(false);
      setActiveTab("publication");
    }
  }

  return (
    <div className="min-w-0">
      <header className="sticky top-0 z-30 -mx-3 border-b border-border/70 bg-background/90 px-3 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="min-w-0 max-w-3xl truncate text-xl font-semibold tracking-normal sm:text-2xl">
                {product.name || "Oferta sem nome"}
              </h1>
              <StatusBadge status={checkoutStatus} />
            </div>
            <AutosaveStatus
              lastSavedAt={lastSavedAt}
              result={saveResult}
              state={saveState}
            />
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={() => setIsPreviewOpen(true)}
              type="button"
              variant="outline"
            >
              <ExternalLink className="size-4" />
              Visualizar checkout
            </Button>
            <Button
              onClick={() => setIsQualityOpen(true)}
              type="button"
              variant="premium"
            >
              <Send className="size-4" />
              Publicar oferta
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-[1180px] py-6 sm:py-8">
        <Tabs
          className="min-w-0"
          onValueChange={(value) => setActiveTab(value as OfferTab)}
          value={activeTab}
        >
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 py-8 sm:py-10">
            <TabsContent value="offer">
              <OfferStep product={product} updateProduct={updateProduct} />
            </TabsContent>
            <TabsContent value="appearance">
              <AppearanceStep
                checkout={checkoutDraft}
                updateCheckout={updateCheckout}
              />
            </TabsContent>
            <TabsContent value="conversion">
              <ConversionStep
                conversion={conversion}
                setConversion={setConversion}
              />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentStep
                paymentSimulation={paymentSimulation}
                previewProduct={previewProduct}
              />
            </TabsContent>
            <TabsContent value="publication">
              <PublicationStep
                checkoutSlug={checkout.checkoutSlug}
                checkoutStatus={checkoutStatus}
                copied={copied}
                isSavingStatus={saveState === "saving"}
                onCopy={copyPublicLink}
                onPublish={() => setIsQualityOpen(true)}
                onUnpublish={() => void setOfferStatus("inactive")}
                publicLink={publicLink}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DrawerContent className="sm:w-[min(76vw,70rem)] sm:min-w-[52rem]">
          <DrawerHeader>
            <DrawerTitle>Visualização</DrawerTitle>
            <DrawerDescription>
              Checkout público com os dados atuais da oferta.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-background">
            <CheckoutTemplate
              badges={checkoutDraft.badges}
              bannerUrl={checkoutDraft.bannerUrl}
              checkoutSlug={checkout.checkoutSlug}
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
        </DrawerContent>
      </Drawer>

      <Drawer open={isQualityOpen} onOpenChange={setIsQualityOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Qualidade da oferta: {quality.score}/100</DrawerTitle>
            <DrawerDescription>
              Recomendações rápidas antes de publicar.
            </DrawerDescription>
          </DrawerHeader>

          <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto px-5 py-5">
            <div className="rounded-md border border-border/70 bg-background/60 p-4">
              <div className="flex min-w-0 items-center justify-between gap-4">
                <span className="text-sm font-medium">Qualidade da oferta</span>
                <span className="shrink-0 text-sm font-semibold">
                  {quality.score}/100
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${quality.score}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-sm font-medium">Ver recomendações</p>
              <ul className="grid gap-2">
                {getPublishRecommendations(quality).map((recommendation) => (
                  <li
                    className="flex min-w-0 items-start gap-2 text-sm leading-6 text-muted-foreground"
                    key={recommendation}
                  >
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-accent" />
                    <span className="min-w-0 break-words">
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/70 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={isPublishing}
              onClick={applyAiImprovements}
              type="button"
              variant="outline"
            >
              <Wand2 className="size-4" />
              Aplicar melhorias
            </Button>
            <Button
              disabled={isPublishing}
              onClick={() => void publishOffer()}
              type="button"
            >
              {isPublishing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Publicar oferta
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
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
    <p
      className={cn(
        "mt-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground",
        isError && "text-destructive",
      )}
      role={isError ? "alert" : "status"}
    >
      {isSaving ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-accent" />
      ) : isError ? (
        <AlertCircle className="size-3.5 shrink-0" />
      ) : (
        <Save className="size-3.5 shrink-0 text-accent" />
      )}
      <span className="min-w-0 truncate">
        {isError
          ? (result?.message ?? "Erro ao salvar")
          : isSaving
            ? "Salvando automaticamente..."
            : formatSavedAt(lastSavedAt)}
      </span>
    </p>
  );
}

function StatusBadge({ status }: { status: CheckoutLink["checkoutStatus"] }) {
  return (
    <Badge
      className={cn(
        "shrink-0",
        status === "published"
          ? "border-success/25 bg-success/10 text-success"
          : "border-warning/25 bg-warning/10 text-warning",
      )}
      variant="outline"
    >
      {getCheckoutStatusLabel(status)}
    </Badge>
  );
}

function OfferStep({
  product,
  updateProduct,
}: {
  product: OfferProductDraft;
  updateProduct: (patch: Partial<OfferProductDraft>) => void;
}) {
  return (
    <EditorSection
      description="Base da oferta apresentada ao comprador."
      icon={Package}
      title="Oferta"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="offer-product-name">Nome</Label>
          <Input
            className="h-11"
            id="offer-product-name"
            maxLength={140}
            onChange={(event) => updateProduct({ name: event.target.value })}
            placeholder="50 Prompts de ChatGPT"
            value={product.name}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="offer-product-category">Categoria</Label>
          <Select
            onValueChange={(value) => updateProduct({ category: value })}
            value={product.category || undefined}
          >
            <SelectTrigger className="h-11" id="offer-product-category">
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
      </div>

      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="offer-product-description">Descrição</Label>
          <span className="text-xs text-muted-foreground">
            {product.description.length}/500
          </span>
        </div>
        <Textarea
          className="min-h-36"
          id="offer-product-description"
          maxLength={500}
          onChange={(event) =>
            updateProduct({ description: event.target.value })
          }
          placeholder="Resumo direto do resultado, conteúdo e entrega."
          value={product.description}
        />
      </FieldGroup>

      <div className="grid gap-5 lg:grid-cols-3">
        <FieldGroup>
          <Label htmlFor="offer-product-price">Preço</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              R$
            </span>
            <Input
              className="h-11 pl-9"
              id="offer-product-price"
              inputMode="numeric"
              onChange={(event) =>
                updateProduct({
                  price: maskPriceInputFromDigits(event.target.value),
                })
              }
              placeholder="0,00"
              value={product.price}
            />
          </div>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="offer-product-image">Imagem</Label>
          <Input
            className="h-11"
            id="offer-product-image"
            onChange={(event) =>
              updateProduct({ imageUrl: event.target.value })
            }
            placeholder="https://cdn.sua-marca.com/oferta.jpg"
            type="url"
            value={product.imageUrl}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="offer-product-status">Status</Label>
          <Select
            onValueChange={(value) =>
              updateProduct({ status: value as EditableProductStatus })
            }
            value={product.status}
          >
            <SelectTrigger className="h-11" id="offer-product-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRODUCT_STATUS_LABELS).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
    </EditorSection>
  );
}

function AppearanceStep({
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

  const guaranteeBadge = checkout.badges.find(
    (badge) => badge.id === "guarantee",
  );
  const secureBadge = checkout.badges.find(
    (badge) => badge.id === "secure_payment",
  );

  return (
    <EditorSection
      description="Personalização visual do checkout público."
      icon={Paintbrush}
      title="Aparência"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="offer-checkout-logo">Logo</Label>
          <Input
            className="h-11"
            id="offer-checkout-logo"
            onChange={(event) =>
              updateCheckout({ logoUrl: event.target.value })
            }
            placeholder="https://cdn.sua-marca.com/logo.png"
            type="url"
            value={checkout.logoUrl}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="offer-checkout-banner">Banner</Label>
          <Input
            className="h-11"
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

      <div className="grid gap-5 lg:grid-cols-2">
        <FieldGroup>
          <Label>Tema</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((theme) => {
              const Icon = theme === "dark" ? Moon : Sun;

              return (
                <button
                  className={cn(
                    "flex h-11 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    checkout.theme === theme
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background/70 text-muted-foreground hover:text-foreground",
                  )}
                  key={theme}
                  onClick={() => updateCheckout({ theme })}
                  type="button"
                >
                  <Icon className="size-4" />
                  {theme === "dark" ? "Escuro" : "Claro"}
                </button>
              );
            })}
          </div>
        </FieldGroup>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="offer-checkout-color">Cor principal</Label>
            <div className="flex min-w-0 items-center gap-3">
              <input
                className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-input bg-background"
                id="offer-checkout-color"
                onChange={(event) =>
                  updateCheckout({ primaryColor: event.target.value })
                }
                type="color"
                value={checkout.primaryColor || DEFAULT_PRIMARY_COLOR}
              />
              <Input
                className="h-11 min-w-0 uppercase"
                onChange={(event) =>
                  updateCheckout({ primaryColor: event.target.value })
                }
                value={checkout.primaryColor}
              />
            </div>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="offer-checkout-secondary-color">
              Cor secundária
            </Label>
            <Input
              className="h-11"
              disabled
              id="offer-checkout-secondary-color"
              value={checkout.theme === "dark" ? "Tema escuro" : "Tema claro"}
            />
          </FieldGroup>
        </div>
      </div>

      <Separator className="bg-border/70" />

      <div className="grid gap-4">
        <SectionLabel icon={BadgeCheck}>Badges</SectionLabel>
        <div className="grid gap-3">
          {checkout.badges.map((badge) => (
            <div
              className="grid min-w-0 gap-3 rounded-md border border-border/70 bg-background/60 p-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center"
              key={badge.id}
            >
              <Switch
                checked={badge.enabled}
                onCheckedChange={(checked) =>
                  updateBadge(badge.id, { enabled: checked })
                }
              />
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

      <div className="grid gap-3 lg:grid-cols-3">
        <ToggleRow
          checked={checkout.securePurchaseEnabled}
          label="Compra segura"
          onCheckedChange={(checked) =>
            updateCheckout({ securePurchaseEnabled: checked })
          }
        />
        <ToggleRow
          checked={Boolean(guaranteeBadge?.enabled)}
          label="Mostrar garantia"
          onCheckedChange={(checked) =>
            updateBadge("guarantee", { enabled: checked })
          }
        />
        <ToggleRow
          checked={Boolean(secureBadge?.enabled)}
          label="Mostrar selo"
          onCheckedChange={(checked) =>
            updateBadge("secure_payment", { enabled: checked })
          }
        />
      </div>
    </EditorSection>
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
    <EditorSection
      description="Argumentos que aumentam confiança antes do pagamento."
      icon={TrendingUp}
      title="Conversão"
    >
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

      <div className="grid gap-5 lg:grid-cols-2">
        <BonusEditor conversion={conversion} setConversion={setConversion} />
        <TestimonialsEditor
          conversion={conversion}
          setConversion={setConversion}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <FaqEditor conversion={conversion} setConversion={setConversion} />
        <FieldGroup>
          <SectionLabel icon={BadgeCheck}>Garantia</SectionLabel>
          <Textarea
            className="min-h-32"
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
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <FieldGroup>
          <SectionLabel icon={Timer}>Urgência e escassez</SectionLabel>
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

        <FieldGroup>
          <SectionLabel icon={Timer}>Contador</SectionLabel>
          <div className="grid gap-3 rounded-md border border-border/70 bg-background/60 p-3">
            <ToggleRow
              checked={conversion.countdownEnabled}
              label="Ativar contador"
              onCheckedChange={(checked) =>
                setConversion((current) => ({
                  ...current,
                  countdownEnabled: checked,
                }))
              }
            />
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
          </div>
        </FieldGroup>
      </div>

      <TrustSealEditor conversion={conversion} setConversion={setConversion} />
    </EditorSection>
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
    <EditorSection
      description="Resumo financeiro da oferta."
      icon={CreditCard}
      title="Pagamento"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <PaymentCapability icon={QrCode} label="PIX" value="Ativo" />
        <PaymentCapability
          icon={CreditCard}
          label="Cartão"
          value="Disponível"
        />
        <PaymentCapability label="Boleto" value="Disponível" />
      </div>

      <div className="grid gap-3 rounded-md border border-border/70 bg-background/60 p-4 sm:p-5">
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
        <Separator className="bg-border/70" />
        <SimulationRow
          highlight
          label="Você recebe"
          value={formatCentsToCurrency(currentPriceCents)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PaymentCapability label="Recebimento" value="Carteira Velto" />
        <PaymentCapability label="Liquidação" value="Padrão da conta" />
        <PaymentCapability label="Taxas" value="Aplicadas na venda" />
      </div>
    </EditorSection>
  );
}

function PublicationStep({
  checkoutSlug,
  checkoutStatus,
  copied,
  isSavingStatus,
  onCopy,
  onPublish,
  onUnpublish,
  publicLink,
}: {
  checkoutSlug: string;
  checkoutStatus: CheckoutLink["checkoutStatus"];
  copied: boolean;
  isSavingStatus: boolean;
  onCopy: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  publicLink: string;
}) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicLink,
  )}`;

  return (
    <EditorSection
      description="Link final e ações de distribuição."
      icon={Send}
      title="Publicação"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid min-w-0 gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Status">
              <StatusBadge status={checkoutStatus} />
            </ReadOnlyField>
            <ReadOnlyField label="Slug">
              <span className="truncate font-mono text-sm">{checkoutSlug}</span>
            </ReadOnlyField>
          </div>

          <ReadOnlyField label="URL">
            <div className="flex min-w-0 items-center gap-2">
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 break-all text-sm">{publicLink}</span>
            </div>
          </ReadOnlyField>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button onClick={onCopy} type="button">
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href={publicLink} target="_blank">
                <ExternalLink className="size-4" />
                Abrir link
              </Link>
            </Button>
            {checkoutStatus === "published" ? (
              <Button
                disabled={isSavingStatus}
                onClick={onUnpublish}
                type="button"
                variant="outline"
              >
                Despublicar
              </Button>
            ) : (
              <Button
                disabled={isSavingStatus}
                onClick={onPublish}
                type="button"
                variant="premium"
              >
                Publicar
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center rounded-md border border-border/70 bg-background/60 p-4 text-center">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <QrCode className="size-4 text-accent" />
            QR Code
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="QR Code do checkout"
            className="size-48 rounded-md border border-border bg-white p-2"
            decoding="async"
            loading="lazy"
            referrerPolicy="no-referrer"
            src={qrCodeUrl}
          />
        </div>
      </div>
    </EditorSection>
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
          <Textarea
            className="min-h-24"
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
          <Textarea
            className="min-h-24"
            onChange={(event) =>
              setConversion((current) => ({
                ...current,
                testimonials: updateById(current.testimonials, testimonial.id, {
                  quote: event.target.value,
                }),
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
      label="Bônus"
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
          <Textarea
            className="min-h-24"
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
    <div className="grid min-w-0 gap-3">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel icon={Icon}>{label}</SectionLabel>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>
      <div className="grid gap-2">{children}</div>
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
    <div className="grid gap-2 rounded-md border border-border/70 bg-background/60 p-3">
      <div className="flex justify-end">
        <IconButton label="Remover" onClick={onRemove} variant="danger">
          <Trash2 className="size-4" />
        </IconButton>
      </div>
      {children}
    </div>
  );
}

function EditorSection({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof Package;
  title: string;
}) {
  return (
    <section className="grid min-w-0 gap-7">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/70 text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="grid min-w-0 gap-7">{children}</div>
    </section>
  );
}

function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-2">{children}</div>;
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
      <Icon className="size-4 shrink-0 text-accent" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function ToggleRow({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border/70 bg-background/60 px-3 py-2.5">
      <span className="min-w-0 truncate text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function PaymentCapability({
  icon: Icon = CheckCircle2,
  label,
  value,
}: {
  icon?: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border/70 bg-background/60 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-accent" />
        <span className="min-w-0 truncate text-sm font-medium">{label}</span>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

function ReadOnlyField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex min-h-11 min-w-0 items-center rounded-md border border-border/70 bg-background/60 px-3 py-2">
        {children}
      </div>
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
        "flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors",
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
