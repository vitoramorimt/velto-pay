"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type CheckoutLinkActionsProps = {
  href: string;
};

export function CheckoutLinkActions({ href }: CheckoutLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button onClick={copyLink} size="sm" type="button" variant="outline">
        {copied ? <Check /> : <Copy />}
        {copied ? "Copiado" : "Copiar link"}
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link href={href} target="_blank">
          <ExternalLink />
          Visualizar
        </Link>
      </Button>
    </div>
  );
}
