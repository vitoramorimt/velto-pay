"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteCheckoutAction } from "@/modules/checkout/presentation/actions";

type CheckoutLinkActionsProps = {
  checkoutId: string;
  href: string;
  previewHref: string;
};

export function CheckoutLinkActions({
  checkoutId,
  href,
  previewHref,
}: CheckoutLinkActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function deleteCheckout() {
    const confirmed = window.confirm(
      "Excluir este checkout? O produto continuará cadastrado.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteCheckoutAction(checkoutId);

    setIsDeleting(false);

    if (result.status === "success") {
      router.refresh();
      return;
    }

    window.alert(result.message);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button
        className="w-full border-accent/20 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground sm:w-auto"
        onClick={copyLink}
        size="sm"
        type="button"
        variant="outline"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      <Button asChild className="w-full sm:w-auto" size="sm" variant="outline">
        <Link href={previewHref} target="_blank">
          <ExternalLink />
          Visualizar
        </Link>
      </Button>
      <Button
        className="w-full sm:w-auto"
        disabled={isDeleting}
        onClick={deleteCheckout}
        size="sm"
        type="button"
        variant="destructive"
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        Excluir
      </Button>
    </div>
  );
}
