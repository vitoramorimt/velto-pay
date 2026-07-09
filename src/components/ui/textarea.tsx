import * as React from "react";

import { cn } from "@/shared/utils/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground hover:border-accent/25 focus-visible:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
