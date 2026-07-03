"use client";

import { createContext, useContext, useMemo } from "react";

import type { AuthenticatedUser } from "@/modules/auth/domain/types";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser: AuthenticatedUser | null;
};

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: initialUser,
      isAuthenticated: Boolean(initialUser),
    }),
    [initialUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
