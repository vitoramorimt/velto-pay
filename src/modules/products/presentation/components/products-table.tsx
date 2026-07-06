"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Search, SlidersHorizontal } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { CreateCheckoutButton } from "@/modules/checkout/presentation/components/create-checkout-button";
import { formatCentsToCurrency } from "@/modules/products/domain/money";
import type { Product } from "@/modules/products/domain/types";
import { cn } from "@/shared/utils/cn";

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

export function ProductsTable({
  checkoutLinksByProductId,
  products,
}: ProductsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Product["status"]>("all");
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus = status === "all" || product.status === status;
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [products, query, status]);

  return (
    <>
      <div className="velto-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium">Catálogo de produtos</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Busque, filtre e gerencie seus produtos digitais.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar produto ou slug"
                value={query}
              />
            </label>

            <div className="flex rounded-lg border border-border bg-muted/35 p-1">
              {[
                ["all", "Todos"],
                ["active", "Ativos"],
                ["inactive", "Inativos"],
              ].map(([value, label]) => (
                <button
                  className={cn(
                    "rounded-md px-3 py-2 text-xs font-medium transition-all",
                    status === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  key={value}
                  onClick={() => setStatus(value as typeof status)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">
              Nenhum produto encontrado
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Ajuste a busca ou remova filtros para visualizar novamente os
              produtos cadastrados.
            </p>
          </CardContent>
        </Card>
      ) : null}

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
            {visibleProducts.map((product) => {
              const checkoutLink = checkoutLinksByProductId[product.id];

              return (
                <TableRow className="transition-colors" key={product.id}>
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
                  <TableCell>
                    {checkoutLink ? (
                      <span className="block max-w-56 truncate text-sm text-muted-foreground">
                        {checkoutLink}
                      </span>
                    ) : (
                      <CreateCheckoutButton productId={product.id} />
                    )}
                  </TableCell>
                  <TableCell>{formatProductDate(product.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/produtos/${product.id}/editar`}>
                          <Pencil />
                          Editar
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
        {visibleProducts.map((product) => {
          const checkoutLink = checkoutLinksByProductId[product.id];

          return (
            <Card className="velto-card min-w-0" key={product.id}>
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
                <div className="grid min-w-0 gap-1 text-sm">
                  <span className="text-muted-foreground">Checkout</span>
                  {checkoutLink ? (
                    <span className="velto-break-anywhere block min-w-0 font-medium leading-5">
                      {checkoutLink}
                    </span>
                  ) : (
                    <CreateCheckoutButton productId={product.id} />
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    asChild
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Link href={`/dashboard/produtos/${product.id}/editar`}>
                      <Pencil />
                      Editar
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
