import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/shared/config/env";
import type { Database } from "@/shared/database.types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
