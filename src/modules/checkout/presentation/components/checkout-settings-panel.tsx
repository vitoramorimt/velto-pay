"use client";

import Link from "next/link";
import { Pencil, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateCheckoutButton } from "@/modules/checkout/presentation/components/create-checkout-button";
import type { CheckoutLink, CheckoutStatus } from "@/modules/checkout/domain/types";

type CheckoutSettingsPanelProps = {
  checkoutLink: CheckoutLink | null;
  productId: string;
};

const statusLabel: Record<CheckoutStatus, string> = {
  disabled: "Desativado",
  draft: "Rascunho",
  published: "Publicado",
};

export function CheckoutSettingsPanel({
  checkoutLink,
  productId,
}: CheckoutSettingsPanelProps) {
  if (!checkoutLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checkouts</CardTitle>
          <CardDescription>
            Selecione um checkout para configurar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Este produto ainda não tem um checkout criado.
            </p>
            <CreateCheckoutButton productId={productId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checkouts</CardTitle>
        <CardDescription>
          Lista de checkouts vinculados a este produto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background/80 text-accent">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Checkout A</p>
              <p className="text-sm text-muted-foreground">
                {checkoutLink.checkoutName} ·{" "}
                {statusLabel[checkoutLink.checkoutStatus]}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link
              href={`/checkout-editor/${productId}`}
              rel="noreferrer"
              target="_blank"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
