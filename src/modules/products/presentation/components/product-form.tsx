"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  createProductAction,
  type ProductActionResult,
  updateProductAction,
} from "@/modules/products/presentation/actions";
import {
  PRODUCT_STATUS_DESCRIPTIONS,
  PRODUCT_STATUS_LABELS,
  type EditableProductStatus,
  type ProductFormValues,
} from "@/modules/products/domain/types";
import { productFormSchema } from "@/modules/products/domain/schemas";
import { cn } from "@/shared/utils/cn";

type ProductFormProps = {
  defaultValues: ProductFormValues;
  mode: "create" | "edit";
};

const editableStatuses: EditableProductStatus[] = [
  "draft",
  "active",
  "inactive",
];

function ProductFormStatus({ result }: { result: ProductActionResult | null }) {
  if (!result) {
    return null;
  }

  const isSuccess = result.status === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        isSuccess
          ? "border-success/25 bg-success/10 text-success"
          : "border-destructive/25 bg-destructive/10 text-destructive",
      )}
      role={isSuccess ? "status" : "alert"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}

export function ProductForm({ defaultValues, mode }: ProductFormProps) {
  const [result, setResult] = useState<ProductActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProductFormValues>({
    defaultValues,
    resolver: zodResolver(productFormSchema),
  });

  function onSubmit(values: ProductFormValues) {
    setResult(null);

    startTransition(() => {
      if (mode === "create") {
        void createProductAction(values).then(setResult);
        return;
      }

      if (!defaultValues.id) {
        setResult({
          message: "Produto invalido.",
          status: "error",
        });
        return;
      }

      void updateProductAction({
        ...values,
        id: defaultValues.id,
      }).then(setResult);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          className="grid gap-6"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <ProductFormStatus result={result} />

          <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do produto</Label>
                <Input
                  id="name"
                  placeholder="Curso completo de marketing digital"
                  {...form.register("name")}
                />
                {form.formState.errors.name ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <textarea
                  className="min-h-32 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  id="description"
                  placeholder="Resumo objetivo do que o comprador recebera."
                  {...form.register("description")}
                />
                {form.formState.errors.description ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preco</Label>
                  <Input
                    id="price"
                    inputMode="decimal"
                    placeholder="197,00"
                    {...form.register("price")}
                  />
                  {form.formState.errors.price ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.price.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="curso-marketing-digital"
                    {...form.register("slug")}
                  />
                  {form.formState.errors.slug ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Imagem do produto</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    type="url"
                    {...form.register("imageUrl")}
                  />
                  {form.formState.errors.imageUrl ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.imageUrl.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryUrl">URL de entrega</Label>
                  <Input
                    id="deliveryUrl"
                    placeholder="https://..."
                    type="url"
                    {...form.register("deliveryUrl")}
                  />
                  {form.formState.errors.deliveryUrl ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.deliveryUrl.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("status", value as EditableProductStatus, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  value={form.watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {editableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PRODUCT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm leading-6 text-muted-foreground">
                  {PRODUCT_STATUS_DESCRIPTIONS[form.watch("status")]}
                </p>
              </div>
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href="/dashboard/produtos">Cancelar</Link>
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {mode === "create" ? "Criar produto" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
