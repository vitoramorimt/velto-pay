import { NextResponse } from "next/server";

import {
  PASSWORD_UPDATE_PATH,
  normalizeAuthRedirectPath,
} from "@/modules/auth/domain/redirects";
import { createSupabaseServerClient } from "@/shared/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next");
  const next =
    rawNext === PASSWORD_UPDATE_PATH
      ? PASSWORD_UPDATE_PATH
      : normalizeAuthRedirectPath(rawNext);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next === PASSWORD_UPDATE_PATH) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      await supabase.auth.signOut();

      return NextResponse.redirect(
        new URL("/login?confirmed=1", requestUrl.origin),
      );
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_callback", requestUrl.origin),
  );
}
