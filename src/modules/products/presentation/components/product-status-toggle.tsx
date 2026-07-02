"use client";

import { useTransition } from "react";
import { Loader2, Power } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/modules/products/domain/types";
import { toggleProductStatusAction } from "@/modules/products/presentation/actions";

type ProductStatusToggleProps = {
  productId: string;
  status: ProductStatus;
};

export function ProductStatusToggle({
  productId,
  status,
}: ProductStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const isArchived = status === "archived";
  const nextStatus = status === "active" ? "inactive" : "active";

  function handleToggle() {
    startTransition(() => {
      void toggleProductStatusAction({
        id: productId,
        status: nextStatus,
      }).then((result) => {
        if (result.status === "success") {
          toast.success(result.message);
          return;
        }

        toast.error(result.message);
      });
    });
  }

  return (
    <Button
      disabled={isPending || isArchived}
      onClick={handleToggle}
      size="sm"
      type="button"
      variant="outline"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Power />}
      {status === "active" ? "Inativar" : "Ativar"}
    </Button>
  );
}
