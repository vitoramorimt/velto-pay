import { CheckCircle2 } from "lucide-react";

type SuccessViewProps = {
  message: string;
};

export function SuccessView({ message }: SuccessViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent/10">
        <CheckCircle2 className="size-9 text-accent" />
      </span>
      <div>
        <p className="text-lg font-semibold">Pedido iniciado</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

type PendingViewProps = {
  message: string;
  title: string;
};

export function PendingView({ message, title }: PendingViewProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/10 p-3 text-left">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
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
