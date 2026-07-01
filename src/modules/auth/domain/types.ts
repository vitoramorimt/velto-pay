import type { User } from "@supabase/supabase-js";

export type AuthRole = "producer" | "affiliate" | "admin" | "support";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  role: AuthRole;
};

const authRoles = ["producer", "affiliate", "admin", "support"] as const;

export function mapSupabaseUser(user: User): AuthenticatedUser {
  const role = user.app_metadata.role;

  return {
    id: user.id,
    email: user.email ?? null,
    role: authRoles.includes(role) ? role : "producer",
  };
}
