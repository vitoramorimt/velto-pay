import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/shared/config/env";
import { notificationEnv } from "@/shared/config/notification-env";
import type { Database } from "@/shared/database.types";

export function createSupabaseAdminClient() {
  if (!notificationEnv.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    notificationEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
