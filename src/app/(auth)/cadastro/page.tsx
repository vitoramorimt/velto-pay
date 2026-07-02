import {
  DEFAULT_AUTHENTICATED_PATH,
  normalizeAuthRedirectPath,
} from "@/modules/auth/domain/redirects";
import {
  AuthCard,
  AuthLink,
} from "@/modules/auth/presentation/components/auth-card";
import { SignUpForm } from "@/modules/auth/presentation/components/sign-up-form";
import { GuestGuard } from "@/modules/auth/presentation/guards/guest-guard";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const next = normalizeAuthRedirectPath(
    params.next ?? DEFAULT_AUTHENTICATED_PATH,
  );

  return (
    <GuestGuard nextPath={next}>
      <AuthCard
        description="Crie sua conta de produtor com Supabase Auth."
        footer={
          <>
            Ja tem uma conta? <AuthLink href="/login">Entrar</AuthLink>
          </>
        }
        showBrand
        title="Criar conta"
      >
        <SignUpForm next={next} />
      </AuthCard>
    </GuestGuard>
  );
}
