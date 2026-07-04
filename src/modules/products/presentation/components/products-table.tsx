"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckoutLinkBox } from "@/modules/checkout/presentation/components/checkout-link-box";
import { CreateCheckoutButton } from "@/modules/checkout/presentation/components/create-checkout-button";
import { formatCentsToCurrency } from "@/modules/products/domain/money";
import type { Product } from "@/modules/products/domain/types";

import { ProductStatusBadge } from "./product-status-badge";
import { ProductStatusToggle } from "./product-status-toggle";

type ProductsTableProps = {
  checkoutLinksByProductId: Record<string, string>;
  products: Product[];
};

function formatProductDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function productSettingsHref(productId: string): string {
  return `/dashboard/produtos/${productId}/configuracoes`;
}

function stopRowNavigation(event: React.MouseEvent | React.KeyboardEvent) {
  event.stopPropagation();
}

export function ProductsTable({
  checkoutLinksByProductId,
  products,
}: ProductsTableProps) {
  const router = useRouter();

  function goToSettings(productId: string) {
    router.push(productSettingsHref(productId));
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card shadow-soft md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Checkout</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const checkoutLink = checkoutLinksByProductId[product.id];

              return (
                <TableRow
                  className="cursor-pointer"
                  key={product.id}
                  onClick={() => goToSettings(product.id)}
                >
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium">{product.name}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        /{product.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>
                    {formatCentsToCurrency(product.price_cents)}
                  </TableCell>
                  <TableCell onClick={stopRowNavigation}>
                    {checkoutLink ? (
                      <CheckoutLinkBox className="max-w-56" link={checkoutLink} />
                    ) : (
                      <CreateCheckoutButton productId={product.id} />
                    )}
                  </TableCell>
                  <TableCell>{formatProductDate(product.updated_at)}</TableCell>
                  <TableCell onClick={stopRowNavigation}>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={productSettingsHref(product.id)}
                          onClick={stopRowNavigation}
                        >
                          <Settings />
                          Configurações
                        </Link>
                      </Button>
                      <ProductStatusToggle
                        productId={product.id}
                        status={product.status}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {products.map((product) => {
          const checkoutLink = checkoutLinksByProductId[product.id];

          return (
            <Card
              className="cursor-pointer"
              key={product.id}
              onClick={() => goToSettings(product.id)}
            >
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{product.name}</CardTitle>
                    <CardDescription className="mt-1 truncate">
                      /{product.slug}
                    </CardDescription>
                  </div>
                  <ProductStatusBadge status={product.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Preço</span>
                  <span className="font-medium">
                    {formatCentsToCurrency(product.price_cents)}
                  </span>
                </div>
                <div className="grid gap-1 text-sm" onClick={stopRowNavigation}>
                  <span className="text-muted-foreground">Checkout</span>
                  {checkoutLink ? (
                    <CheckoutLinkBox link={checkoutLink} />
                  ) : (
                    <CreateCheckoutButton productId={product.id} />
                  )}
                </div>
                <div
                  className="flex flex-col gap-2 sm:flex-row"
                  onClick={stopRowNavigation}
                >
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Link
                      href={productSettingsHref(product.id)}
                      onClick={stopRowNavigation}
                    >
                      <Settings />
                      Configurações
                    </Link>
                  </Button>
                  <ProductStatusToggle
                    productId={product.id}
                    status={product.status}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
