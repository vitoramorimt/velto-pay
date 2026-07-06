"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createCheckoutForProductAction } from "@/modules/checkout/presentation/actions";

type CreateCheckoutButtonProps = {
  productId: string;
};

export function CreateCheckoutButton({ productId }: CreateCheckoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function createCheckout() {
    setIsPending(true);
    const result = await createCheckoutForProductAction(productId);

    setIsPending(false);

    if (result.status === "success") {
      router.refresh();
      return;
    }

    window.alert(result.message);
  }

  return (
    <Button
      className="border-accent/20 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
      disabled={isPending}
      onClick={createCheckout}
      size="sm"
      type="button"
      variant="outline"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
      Criar checkout
    </Button>
  );
}
