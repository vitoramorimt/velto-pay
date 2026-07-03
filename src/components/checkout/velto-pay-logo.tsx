import { cn } from "@/lib/utils";

export function VeltoPayLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-brand-green text-sm font-bold text-primary-foreground">
        V
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        VeltoPay
      </span>
    </div>
  );
}
