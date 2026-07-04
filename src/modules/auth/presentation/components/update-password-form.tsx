"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  updatePasswordAction,
  type AuthActionResult,
} from "@/modules/auth/application/auth-actions";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/modules/auth/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormStatus } from "./form-status";

export function UpdatePasswordForm() {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdatePasswordInput>({
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
    resolver: zodResolver(updatePasswordSchema),
  });

  function onSubmit(values: UpdatePasswordInput) {
    setResult(null);

    startTransition(() => {
      void updatePasswordAction(values).then(setResult);
    });
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormStatus result={result} />

      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          autoComplete="new-password"
          className="h-11 border-white/10 bg-black/25 text-white placeholder:text-slate-500 transition-all focus-visible:border-accent/40 focus-visible:ring-accent/35"
          id="password"
          placeholder="Mínimo de 8 caracteres"
          type="password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          autoComplete="new-password"
          className="h-11 border-white/10 bg-black/25 text-white placeholder:text-slate-500 transition-all focus-visible:border-accent/40 focus-visible:ring-accent/35"
          id="confirmPassword"
          placeholder="Repita a nova senha"
          type="password"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button
        className="h-11 w-full bg-accent text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.22)] hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_24px_70px_rgba(25,205,139,0.26)]"
        disabled={isPending}
        type="submit"
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Atualizar senha
      </Button>
    </form>
  );
}
