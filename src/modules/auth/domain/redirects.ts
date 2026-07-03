export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";
export const LOGIN_PATH = "/login";
export const PASSWORD_RESET_PATH = "/recuperar-senha";
export const PASSWORD_UPDATE_PATH = "/redefinir-senha";

const guestOnlyPaths = ["/login", "/cadastro", "/recuperar-senha"];
const protectedPathPrefixes = ["/dashboard", "/admin"];

export function isGuestOnlyPath(pathname: string): boolean {
  return guestOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function normalizeAuthRedirectPath(
  value: string | null | undefined,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  if (
    value.startsWith("/auth/") ||
    isGuestOnlyPath(value) ||
    value === PASSWORD_UPDATE_PATH
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return value;
}
