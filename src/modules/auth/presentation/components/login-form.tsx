"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  signInAction,
  type AuthActionResult,
} from "@/modules/auth/application/auth-actions";
import { signInSchema, type SignInInput } from "@/modules/auth/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormStatus } from "./form-status";

type LoginFormProps = {
  next: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<SignInInput>({
    defaultValues: {
      email: "",
      next,
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  function onSubmit(values: SignInInput) {
    setResult(null);

    startTransition(() => {
      void signInAction({ ...values, next }).then(setResult);
    });
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormStatus result={result} />

      <input type="hidden" value={next} {...form.register("next")} />

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

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Senha</Label>
          <Link
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            href="/recuperar-senha"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Input
          autoComplete="current-password"
          id="password"
          placeholder="Sua senha"
          type="password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Entrar
      </Button>
    </form>
  );
}
