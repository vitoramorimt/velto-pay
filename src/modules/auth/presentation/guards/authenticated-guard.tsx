import { requireAuthenticatedUser } from "@/modules/auth/application/guards";

type AuthenticatedGuardProps = {
  children: React.ReactNode;
  nextPath?: string;
};

export async function AuthenticatedGuard({
  children,
  nextPath,
}: AuthenticatedGuardProps) {
  await requireAuthenticatedUser(nextPath);

  return <>{children}</>;
}
