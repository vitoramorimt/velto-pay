import type { CookieOptionsWithName } from "@supabase/ssr";

export const supabaseCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} satisfies CookieOptionsWithName;
