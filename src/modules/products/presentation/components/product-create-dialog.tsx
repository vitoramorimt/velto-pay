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

type ProductCreateDialogProps = {
  children: React.ReactNode;
};

const defaultProductValues: ProductFormValues = {
  deliveryUrl: "",
  description: "",
  name: "",
  price: "",
  salesPageUrl: "",
  slug: "",
  status: "draft",
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

  function handleSuccess() {
    setOpen(false);
    resetForm();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bottom-0 top-auto max-h-[92dvh] w-[calc(100%-1rem)] translate-y-0 overflow-y-auto rounded-b-none border-white/10 bg-[#050c09] p-0 text-slate-100 shadow-[0_32px_120px_rgba(0,0,0,0.5)] sm:bottom-auto sm:top-[50%] sm:max-w-3xl sm:translate-y-[-50%] sm:rounded-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Criar produto</DialogTitle>
          <DialogDescription>
            Configure a estrutura e os detalhes do novo produto.
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
