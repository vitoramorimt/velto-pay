"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_PATH,
  normalizeAuthRedirectPath,
} from "@/modules/auth/domain/redirects";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  type RequestPasswordResetInput,
  type SignInInput,
  type SignUpInput,
  type UpdatePasswordInput,
} from "@/modules/auth/domain/schemas";
import { createSupabaseServerClient } from "@/shared/supabase";

export type AuthActionResult = {
  status: "success" | "error";
  message: string;
};

function validationError(): AuthActionResult {
  return {
    status: "error",
    message: "Revise os campos destacados e tente novamente.",
  };
}

async function getRequestOrigin(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get("origin");

  if (origin) {
    return origin;
  }

  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function signInAction(
  input: SignInInput,
): Promise<AuthActionResult> {
  const parsedInput = signInSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsedInput.data.email,
    password: parsedInput.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  redirect(normalizeAuthRedirectPath(parsedInput.data.next));
}

export async function signUpAction(
  input: SignUpInput,
): Promise<AuthActionResult> {
  const parsedInput = signUpSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  const origin = await getRequestOrigin();
  const next = normalizeAuthRedirectPath(
    parsedInput.data.next ?? DEFAULT_AUTHENTICATED_PATH,
  );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsedInput.data.email,
    password: parsedInput.data.password,
    options: {
      data: {
        full_name: parsedInput.data.fullName,
        role: "producer",
      },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível criar sua conta agora.",
    };
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  return {
    status: "success",
    message: "Cadastro iniciado. Verifique seu e-mail para confirmar o acesso.",
  };
}

export async function requestPasswordResetAction(
  input: RequestPasswordResetInput,
): Promise<AuthActionResult> {
  const parsedInput = requestPasswordResetSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  const origin = await getRequestOrigin();
  const supabase = await createSupabaseServerClient();

  await supabase.auth.resetPasswordForEmail(parsedInput.data.email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/redefinir-senha")}`,
  });

  return {
    status: "success",
    message:
      "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.",
  };
}

export async function updatePasswordAction(
  input: UpdatePasswordInput,
): Promise<AuthActionResult> {
  const parsedInput = updatePasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    return validationError();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sua sessão expirou. Solicite um novo link de recuperação.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsedInput.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível atualizar sua senha agora.",
    };
  }

  redirect(DEFAULT_AUTHENTICATED_PATH);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}
