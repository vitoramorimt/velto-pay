import {
  DEFAULT_AUTHENTICATED_PATH,
  normalizeAuthRedirectPath,
} from "@/modules/auth/domain/redirects";
import { GuestGuard } from "@/modules/auth/presentation/guards/guest-guard";
import {
  AuthCard,
  AuthLink,
} from "@/modules/auth/presentation/components/auth-card";
import { LoginForm } from "@/modules/auth/presentation/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    confirmed?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = normalizeAuthRedirectPath(
    params.next ?? DEFAULT_AUTHENTICATED_PATH,
  );
  const confirmedResult =
    params.confirmed === "1"
      ? {
          message: "E-mail confirmado com sucesso. Faça login para continuar.",
          status: "success" as const,
        }
      : null;

  return (
    <GuestGuard nextPath={next}>
      <AuthCard
        description="Acesse sua conta para gerenciar produtos, acompanhar a operação e preparar suas vendas."
        footer={
          <>
            Ainda não tem conta?{" "}
            <AuthLink href="/cadastro">Criar conta</AuthLink>
          </>
        }
        showBrand
        title="Entrar na conta"
      >
        <LoginForm initialResult={confirmedResult} next={next} />
      </AuthCard>
    </GuestGuard>
  );
}
