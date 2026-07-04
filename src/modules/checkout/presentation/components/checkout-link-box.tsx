"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckoutStatus } from "@/modules/checkout/domain/types";
import { cn } from "@/shared/utils/cn";

type CheckoutLinkBoxProps = {
  className?: string;
  link: string;
  status?: CheckoutStatus;
};

const statusLabel: Record<CheckoutStatus, string> = {
  disabled: "Desativado",
  draft: "Rascunho",
  published: "Publicado",
};

export function CheckoutLinkBox({
  className,
  link,
  status,
}: CheckoutLinkBoxProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2",
        className,
      )}
    >
      {status ? (
        <Badge className="shrink-0" variant="outline">
          {statusLabel[status]}
        </Badge>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
        {link}
      </span>
      <Button
        className="shrink-0"
        onClick={handleCopy}
        size="icon"
        title="Copiar link"
        type="button"
        variant="ghost"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <Button asChild className="shrink-0" size="icon" title="Abrir checkout" variant="ghost">
        <a
          href={link}
          onClick={(event) => event.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
