import Link from "next/link";
import { Pencil } from "lucide-react";

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

export function ProductsTable({
  checkoutLinksByProductId,
  products,
}: ProductsTableProps) {
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
                <TableRow key={product.id}>
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
        {products.map((product) => {
          const checkoutLink = checkoutLinksByProductId[product.id];

          return (
            <Card className="min-w-0" key={product.id}>
              <CardHeader className="min-w-0 gap-3">
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
              <CardContent className="min-w-0 space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Preço</span>
                  <span className="font-medium">
                    {formatCentsToCurrency(product.price_cents)}
                  </span>
                </div>
                <div className="grid min-w-0 gap-1 text-sm">
                  <span className="text-muted-foreground">Checkout</span>
                  {checkoutLink ? (
                    <span className="block max-w-full truncate font-medium">
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
