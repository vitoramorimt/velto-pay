import {
  AuthCard,
  AuthLink,
} from "@/modules/auth/presentation/components/auth-card";
import { PasswordResetForm } from "@/modules/auth/presentation/components/password-reset-form";
import { GuestGuard } from "@/modules/auth/presentation/guards/guest-guard";

export default function RecoverPasswordPage() {
  return (
    <GuestGuard>
      <AuthCard
        description="Informe seu e-mail para receber o link de redefinição."
        footer={
          <>
            Lembrou a senha? <AuthLink href="/login">Entrar</AuthLink>
          </>
        }
        showBrand
        title="Recuperar senha"
      >
        <PasswordResetForm />
      </AuthCard>
    </GuestGuard>
  );
}
