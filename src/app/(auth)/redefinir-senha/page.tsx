import { requirePasswordResetSession } from "@/modules/auth/application/guards";
import { AuthCard } from "@/modules/auth/presentation/components/auth-card";
import { UpdatePasswordForm } from "@/modules/auth/presentation/components/update-password-form";

export default async function UpdatePasswordPage() {
  await requirePasswordResetSession();

  return (
    <AuthCard
      description="Defina uma nova senha para continuar usando a Velto Pay."
      showBrand
      title="Redefinir senha"
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
