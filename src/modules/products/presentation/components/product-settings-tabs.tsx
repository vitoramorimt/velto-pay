"use client";

import { useState } from "react";
import { CreditCard, FileText, Link2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckoutLinkBox } from "@/modules/checkout/presentation/components/checkout-link-box";
import { CheckoutSettingsPanel } from "@/modules/checkout/presentation/components/checkout-settings-panel";
import { CreateCheckoutButton } from "@/modules/checkout/presentation/components/create-checkout-button";
import type { CheckoutLink } from "@/modules/checkout/domain/types";
import { ProductForm } from "@/modules/products/presentation/components/product-form";
import type { ProductFormValues } from "@/modules/products/domain/types";
import { cn } from "@/shared/utils/cn";

type SettingsTab = "info" | "checkout" | "links";

const tabs: Array<{ icon: typeof FileText; label: string; value: SettingsTab }> = [
  {
    icon: FileText,
    label: "Informações do produto",
    value: "info",
  },
  {
    icon: CreditCard,
    label: "Checkout",
    value: "checkout",
  },
  {
    icon: Link2,
    label: "Links",
    value: "links",
  },
];

type ProductSettingsTabsProps = {
  checkoutLink: CheckoutLink | null;
  product: ProductFormValues;
  productId: string;
};

export function ProductSettingsTabs({
  checkoutLink,
  product,
  productId,
}: ProductSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("info");

  return (
    <div className="grid gap-6">
      <div
        className="flex gap-1 overflow-x-auto border-b border-border"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              role="tab"
              type="button"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "info" ? (
        <ProductForm defaultValues={product} mode="edit" />
      ) : null}

      {activeTab === "checkout" ? (
        <CheckoutSettingsPanel
          checkoutLink={checkoutLink}
          productId={productId}
        />
      ) : null}

      {activeTab === "links" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link de checkout</CardTitle>
            <CardDescription>
              Compartilhe este link com seus compradores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkoutLink ? (
              <CheckoutLinkBox
                link={checkoutLink.link}
                status={checkoutLink.checkoutStatus}
              />
            ) : (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Este produto ainda não tem um checkout criado.
                </p>
                <CreateCheckoutButton productId={productId} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
