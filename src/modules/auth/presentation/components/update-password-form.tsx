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
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormStatus result={result} />

      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          autoComplete="new-password"
          id="password"
          placeholder="Minimo de 8 caracteres"
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

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Atualizar senha
      </Button>
    </form>
  );
}
