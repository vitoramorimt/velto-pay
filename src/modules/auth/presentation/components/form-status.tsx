import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { AuthActionResult } from "@/modules/auth/application/auth-actions";
import { cn } from "@/shared/utils/cn";

type FormStatusProps = {
  result: AuthActionResult | null;
};

export function FormStatus({ result }: FormStatusProps) {
  if (!result) {
    return null;
  }

  const isSuccess = result.status === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        isSuccess
          ? "border-success/25 bg-success/10 text-success"
          : "border-destructive/25 bg-destructive/10 text-destructive",
      )}
      role={isSuccess ? "status" : "alert"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}
