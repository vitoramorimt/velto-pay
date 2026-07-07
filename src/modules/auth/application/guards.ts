import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  PASSWORD_RESET_PATH,
  normalizeAuthRedirectPath,
} from "@/modules/auth/domain/redirects";
import {
  type AuthenticatedUser,
  mapSupabaseUser,
} from "@/modules/auth/domain/types";
import {
  devBypassProducer,
  isDevBypassEnabled,
} from "@/shared/dev/mock-data-store";
import { createSupabaseServerClient } from "@/shared/supabase";

const devBypassUser: AuthenticatedUser = {
  id: devBypassProducer.user_id,
  email: "dev@local",
  fullName: "Conta de Testes (Dev)",
  role: "producer",
};

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    if (isDevBypassEnabled()) {
      return devBypassUser;
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user ? mapSupabaseUser(user) : null;
  },
);

export async function requireAuthenticatedUser(
  nextPath = DEFAULT_AUTHENTICATED_PATH,
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requirePasswordResetSession(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(PASSWORD_RESET_PATH);
  }

  return user;
}

export async function redirectAuthenticatedUser(
  nextPath?: string | null,
): Promise<void> {
  const user = await getCurrentUser();

  if (user) {
    redirect(normalizeAuthRedirectPath(nextPath));
  }
}
