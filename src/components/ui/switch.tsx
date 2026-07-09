"use client";

import * as React from "react";

import { cn } from "@/shared/utils/cn";

type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "role"
> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, disabled, onCheckedChange, ...props }, ref) => (
    <button
      ref={ref}
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-primary",
        className,
      )}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span
        className={cn(
          "block size-5 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  ),
);
Switch.displayName = "Switch";

export { Switch };
