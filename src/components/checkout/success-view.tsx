import { CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessViewProps {
  message: string;
  successUrl?: string | null;
}

export function SuccessView({ message, successUrl }: SuccessViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-green-soft">
        <CheckCircle2 className="size-9 text-brand-green" />
      </span>
      <div>
        <p className="text-lg font-semibold">Pagamento confirmado</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {successUrl ? (
        <a href={successUrl} className={cn(buttonVariants({ variant: "default" }))}>
          Voltar para a loja
        </a>
      ) : null}
    </div>
  );
}

interface PendingViewProps {
  title: string;
  message: string;
}

export function PendingView({ title, message }: PendingViewProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-green-soft bg-brand-green-soft/50 p-3 text-left">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-brand-green" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </div>
  );
}
