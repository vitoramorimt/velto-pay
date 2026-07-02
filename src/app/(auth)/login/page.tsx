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
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = normalizeAuthRedirectPath(
    params.next ?? DEFAULT_AUTHENTICATED_PATH,
  );

  return (
    <GuestGuard nextPath={next}>
      <AuthCard
        description="Entre com e-mail e senha para acessar a área privada."
        footer={
          <>
            Ainda não tem conta?{" "}
            <AuthLink href="/cadastro">Criar conta</AuthLink>
          </>
        }
        showBrand
        title="Entrar na Velto Pay"
      >
        <LoginForm next={next} />
      </AuthCard>
    </GuestGuard>
  );
}
