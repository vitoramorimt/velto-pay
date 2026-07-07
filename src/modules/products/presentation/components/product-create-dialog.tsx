"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProductFormValues } from "@/modules/products/domain/types";
import { ProductForm } from "@/modules/products/presentation/components/product-form";
import type { ProductActionResult } from "@/modules/products/presentation/actions";

type ProductCreateDialogProps = {
  children: React.ReactNode;
};

const defaultProductValues: ProductFormValues = {
  category: "",
  deliveryUrl: "",
  description: "",
  name: "",
  price: "",
  salesPageUrl: "",
  slug: "",
  status: "active",
};

export function ProductCreateDialog({ children }: ProductCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function resetForm() {
    setFormKey((currentKey) => currentKey + 1);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  function handleSuccess(result: ProductActionResult) {
    setOpen(false);
    resetForm();

    if (result.productId) {
      router.push(`/dashboard/produtos/${result.productId}/configuracoes`);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bottom-[var(--safe-area-bottom)] top-auto max-h-[calc(100dvh-var(--safe-area-top)-var(--safe-area-bottom)-0.75rem)] w-[calc(100%-1rem)] translate-y-0 overflow-y-auto rounded-b-none border-white/10 bg-transparent p-0 shadow-[0_42px_140px_rgba(0,0,0,0.48)] sm:bottom-auto sm:top-[50%] sm:max-h-[92dvh] sm:max-w-3xl sm:translate-y-[-50%] sm:rounded-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Criar oferta</DialogTitle>
          <DialogDescription>
            Configure a estrutura inicial e abra o centro de oferta.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={defaultProductValues}
          key={formKey}
          mode="create"
          onCancel={() => handleOpenChange(false)}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
