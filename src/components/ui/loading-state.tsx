import { Loader2 } from "lucide-react";

import { cn } from "@/shared/utils/cn";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({
  label = "Carregando interface",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm",
        className,
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  );
}
