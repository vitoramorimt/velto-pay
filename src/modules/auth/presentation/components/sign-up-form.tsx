"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  signUpAction,
  type AuthActionResult,
} from "@/modules/auth/application/auth-actions";
import { signUpSchema, type SignUpInput } from "@/modules/auth/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormStatus } from "./form-status";

type SignUpFormProps = {
  next: string;
};

export function SignUpForm({ next }: SignUpFormProps) {
  const [result, setResult] = useState<AuthActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<SignUpInput>({
    defaultValues: {
      email: "",
      fullName: "",
      next,
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  function onSubmit(values: SignUpInput) {
    setResult(null);

    startTransition(() => {
      void signUpAction({ ...values, next }).then(setResult);
    });
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormStatus result={result} />

      <input type="hidden" value={next} {...form.register("next")} />

      <div className="space-y-2">
        <Label htmlFor="fullName">Nome</Label>
        <Input
          autoComplete="name"
          className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
          id="fullName"
          placeholder="Seu nome completo"
          type="text"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          autoComplete="email"
          className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
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
        <Label htmlFor="password">Senha</Label>
        <Input
          autoComplete="new-password"
          className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
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

      <Button
        className="h-10 w-full bg-accent text-accent-foreground shadow-[0_18px_52px_rgba(25,205,139,0.18)] hover:bg-accent/90"
        disabled={isPending}
        type="submit"
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Criar minha conta
      </Button>
    </form>
  );
}
