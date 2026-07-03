import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/shared/config/env";
import type { Database } from "@/shared/database.types";
import { supabaseCookieOptions } from "@/shared/supabase/cookie-options";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                ...supabaseCookieOptions,
              });
            });
          } catch {
            // Server Components cannot set cookies; Server Actions and Route Handlers can.
          }
        },
      },
    },
  );
}
