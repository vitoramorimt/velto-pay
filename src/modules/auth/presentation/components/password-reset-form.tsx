"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  requestPasswordResetAction,
  type AuthActionResult,
} from "@/modules/auth/application/auth-actions";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/modules/auth/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormStatus } from "./form-status";

export function PasswordResetForm() {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<RequestPasswordResetInput>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(requestPasswordResetSchema),
  });

  function onSubmit(values: RequestPasswordResetInput) {
    setResult(null);

    startTransition(() => {
      void requestPasswordResetAction(values).then(setResult);
    });
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormStatus result={result} />

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          autoComplete="email"
          id="email"
          placeholder="nome@empresa.com"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <Button
        className="w-full bg-accent text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.18)] hover:bg-accent/90"
        disabled={isPending}
        type="submit"
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Enviar link
      </Button>
    </form>
  );
}
