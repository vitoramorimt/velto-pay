import { CheckCircle2 } from "lucide-react";

type SuccessViewProps = {
  message: string;
};

export function SuccessView({ message }: SuccessViewProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-4 py-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent/10">
        <CheckCircle2 className="size-9 text-accent" />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-semibold">Pedido iniciado</p>
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
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
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-accent/20 bg-accent/10 p-3 text-left">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs leading-5 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm leading-6 text-destructive">
      {message}
    </div>
  );
}
