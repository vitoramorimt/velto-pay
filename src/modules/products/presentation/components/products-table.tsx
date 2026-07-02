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
import { formatCentsToCurrency } from "@/modules/products/domain/money";
import type { Product } from "@/modules/products/domain/types";

import { ProductStatusBadge } from "./product-status-badge";
import { ProductStatusToggle } from "./product-status-toggle";

type ProductsTableProps = {
  products: Product[];
};

function formatProductDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card shadow-soft md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {products.map((product) => (
          <Card key={product.id}>
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
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="w-full" size="sm" variant="outline">
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
        ))}
      </div>
    </>
  );
}
