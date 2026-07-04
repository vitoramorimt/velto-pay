import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-card/70 px-6 py-10 text-center shadow-sm",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {actionLabel ? (
        <Button className="mt-5" size="sm" type="button" variant="outline">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
