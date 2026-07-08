"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

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
import type { CheckoutOffer } from "@/modules/checkout/domain/types";
import {
  createCheckoutOfferAction,
  deleteCheckoutOfferAction,
  updateCheckoutOfferAction,
  type CheckoutOfferActionResult,
} from "@/modules/checkout/presentation/actions";
import {
  formatCentsToCurrency,
  formatCentsToMaskedInput,
  maskPriceInputFromDigits,
  parseProductPriceToCents,
} from "@/modules/products/domain/money";
import type { Product } from "@/modules/products/domain/types";
import { cn } from "@/shared/utils/cn";

const MAX_ORDER_BUMPS = 5;

type OfferFormState = {
  amountCentsInput: string;
  badgeText: string;
  description: string;
  productId: string;
  title: string;
};

const emptyForm: OfferFormState = {
  amountCentsInput: "",
  badgeText: "",
  description: "",
  productId: "",
  title: "",
};

type CheckoutOrderBumpPanelProps = {
  checkoutId: string;
  checkoutSlug: string;
  initialOffers: CheckoutOffer[];
  onOffersChange?: (offers: CheckoutOffer[]) => void;
  producerProducts: Product[];
  productId: string;
};

export function CheckoutOrderBumpPanel({
  checkoutId,
  checkoutSlug,
  initialOffers,
  onOffersChange,
  producerProducts,
  productId,
}: CheckoutOrderBumpPanelProps) {
  const [offers, setOffers] = useState<CheckoutOffer[]>(initialOffers);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OfferFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutOfferActionResult | null>(null);

  const usedProductIds = new Set(
    offers
      .map((offer) => offer.product_id)
      .filter((id): id is string => Boolean(id)),
  );
  const availableProducts = producerProducts.filter(
    (product) => !usedProductIds.has(product.id),
  );
  const canAddMore = offers.length < MAX_ORDER_BUMPS;

  function applyOffers(next: CheckoutOffer[]) {
    setOffers(next);
    onOffersChange?.(next);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingOfferId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setResult(null);
    setForm(emptyForm);
    setEditingOfferId(null);
    setShowForm(true);
  }

  function openEditForm(offer: CheckoutOffer) {
    setResult(null);
    setForm({
      amountCentsInput: formatCentsToMaskedInput(offer.amount_cents),
      badgeText: offer.badge_text ?? "",
      description: offer.description ?? "",
      productId: offer.product_id ?? "",
      title: offer.title,
    });
    setEditingOfferId(offer.id);
    setShowForm(true);
  }

  function handleSelectProduct(selectedProductId: string) {
    const product = availableProducts.find(
      (item) => item.id === selectedProductId,
    );

    setForm((current) => ({
      ...current,
      amountCentsInput: product
        ? formatCentsToMaskedInput(product.price_cents)
        : current.amountCentsInput,
      description: product?.description
        ? product.description.slice(0, 280)
        : current.description,
      productId: selectedProductId,
      title: product?.name ?? current.title,
    }));
  }

  async function handleSubmit() {
    const amountCents = parseProductPriceToCents(form.amountCentsInput);

    if (amountCents === null) {
      setResult({ message: "Informe um preço válido.", status: "error" });
      return;
    }

    if (!editingOfferId && !form.productId) {
      setResult({ message: "Selecione um produto.", status: "error" });
      return;
    }

    setIsSaving(true);
    setResult(null);

    const actionResult = editingOfferId
      ? await updateCheckoutOfferAction(
          editingOfferId,
          productId,
          checkoutSlug,
          {
            amountCents,
            badgeText: form.badgeText || null,
            description: form.description || null,
            title: form.title,
          },
        )
      : await createCheckoutOfferAction(checkoutId, productId, checkoutSlug, {
          amountCents,
          badgeText: form.badgeText || null,
          description: form.description || null,
          productId: form.productId,
          title: form.title,
        });

    setIsSaving(false);
    setResult(actionResult);

    if (actionResult.status === "success" && actionResult.offer) {
      const savedOffer = actionResult.offer;

      applyOffers(
        editingOfferId
          ? offers.map((offer) =>
              offer.id === savedOffer.id ? savedOffer : offer,
            )
          : [...offers, savedOffer],
      );
      resetForm();
    }
  }

  async function handleDelete(offerId: string) {
    setDeletingOfferId(offerId);
    setResult(null);

    const actionResult = await deleteCheckoutOfferAction(
      offerId,
      productId,
      checkoutSlug,
    );

    setDeletingOfferId(null);

    if (actionResult.status === "success") {
      applyOffers(offers.filter((offer) => offer.id !== offerId));
    } else {
      setResult(actionResult);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Order bumps</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Ofertas de produtos já existentes, exibidas no checkout para o
          comprador adicionar com um clique. Máximo de {MAX_ORDER_BUMPS}.
        </p>
      </div>

      {offers.length > 0 ? (
        <ul className="space-y-2">
          {offers.map((offer) => (
            <li
              className="flex items-start justify-between gap-2 rounded-md border border-border p-3"
              key={offer.id}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{offer.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCentsToCurrency(offer.amount_cents)}
                  {offer.badge_text ? ` · ${offer.badge_text}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  onClick={() => openEditForm(offer)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  disabled={deletingOfferId === offer.id}
                  onClick={() => handleDelete(offer.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {deletingOfferId === offer.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          Nenhum order bump adicionado ainda.
        </p>
      )}

      {showForm ? (
        <div className="space-y-3 rounded-md border border-border p-3">
          {!editingOfferId ? (
            <div className="space-y-2">
              <Label htmlFor="offer-product">Produto</Label>
              {availableProducts.length > 0 ? (
                <Select
                  onValueChange={handleSelectProduct}
                  value={form.productId}
                >
                  <SelectTrigger id="offer-product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ·{" "}
                        {formatCentsToCurrency(product.price_cents)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nenhum outro produto disponível para usar como order bump.
                  Crie um novo produto primeiro.
                </p>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="offer-title">Título</Label>
            <Input
              id="offer-title"
              maxLength={140}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              value={form.title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer-description">Descrição</Label>
            <textarea
              className="min-h-16 w-full max-w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="offer-description"
              maxLength={280}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              value={form.description}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="offer-amount">Preço do bump</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  R$
                </span>
                <Input
                  className="pl-9"
                  id="offer-amount"
                  inputMode="numeric"
                  onChange={(event) => {
                    const masked = maskPriceInputFromDigits(
                      event.target.value,
                    );

                    setForm((current) => ({
                      ...current,
                      amountCentsInput: masked,
                    }));
                  }}
                  placeholder="0,00"
                  value={form.amountCentsInput}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-badge">Selo (opcional)</Label>
              <Input
                id="offer-badge"
                maxLength={60}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    badgeText: event.target.value,
                  }))
                }
                placeholder="Oferta especial"
                value={form.badgeText}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button disabled={isSaving} onClick={handleSubmit} type="button">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingOfferId ? "Salvar alterações" : "Adicionar order bump"}
            </Button>
            <Button onClick={resetForm} type="button" variant="ghost">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          disabled={!canAddMore || availableProducts.length === 0}
          onClick={openCreateForm}
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Adicionar order bump
        </Button>
      )}

      {!canAddMore ? (
        <p className="text-xs text-muted-foreground">
          Limite de {MAX_ORDER_BUMPS} order bumps atingido.
        </p>
      ) : null}

      {result ? (
        <p
          className={cn(
            "text-sm",
            result.status === "success" ? "text-success" : "text-destructive",
          )}
          role={result.status === "success" ? "status" : "alert"}
        >
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
