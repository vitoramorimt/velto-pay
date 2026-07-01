import { redirectAuthenticatedUser } from "@/modules/auth/application/guards";

type GuestGuardProps = {
  children: React.ReactNode;
  nextPath?: string | null;
};

export async function GuestGuard({ children, nextPath }: GuestGuardProps) {
  await redirectAuthenticatedUser(nextPath);

  return <>{children}</>;
}
