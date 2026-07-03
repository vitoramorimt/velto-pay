"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PixPaymentDetails } from "@/domain/entities/payment";

interface PixPanelProps {
  submitting: boolean;
  pixDetails: PixPaymentDetails | null;
  onGenerate: () => void;
}

export function PixPanel({ submitting, pixDetails, onGenerate }: PixPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!pixDetails) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Gere um QR Code PIX e pague instantaneamente pelo app do seu banco.
        </p>
        <Button className="w-full" disabled={submitting} onClick={onGenerate}>
          {submitting ? "Gerando..." : "Gerar QR Code"}
        </Button>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixDetails.qrCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-center">
      <Image
        src={pixDetails.qrCodeImageUrl}
        alt="QR Code PIX"
        width={192}
        height={192}
        unoptimized
        className="mx-auto h-48 w-48 rounded-md border"
      />
      <p className="text-sm text-muted-foreground">
        Escaneie o QR Code ou copie o código abaixo no app do seu banco.
      </p>
      <Button variant="outline" className="w-full" onClick={handleCopy}>
        {copied ? "Código copiado!" : "Copiar código PIX"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Expira em {new Date(pixDetails.expiresAt).toLocaleTimeString("pt-BR")}
      </p>
    </div>
  );
}
