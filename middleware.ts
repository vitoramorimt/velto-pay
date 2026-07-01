import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  PASSWORD_RESET_PATH,
  PASSWORD_UPDATE_PATH,
  isGuestOnlyPath,
  isProtectedPath,
  normalizeAuthRedirectPath,
} from "@/modules/auth/domain/redirects";
import { publicEnv } from "@/shared/config/env";
import type { Database } from "@/shared/database.types";
import { supabaseCookieOptions } from "@/shared/supabase/cookie-options";

function appendAuthCookies(
  targetResponse: NextResponse,
  sourceResponse: NextResponse,
): NextResponse {
  sourceResponse.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie.name, cookie.value, {
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      path: cookie.path,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
    });
  });

  sourceResponse.headers.forEach((value, key) => {
    if (!["set-cookie", "x-middleware-next"].includes(key.toLowerCase())) {
      targetResponse.headers.set(key, value);
    }
  });

  return targetResponse;
}

function redirectWithAuthCookies(
  request: NextRequest,
  response: NextResponse,
  path: string,
): NextResponse {
  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = path;
  redirectUrl.search = "";

  return appendAuthCookies(NextResponse.redirect(redirectUrl), response);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: supabaseCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              ...supabaseCookieOptions,
            });
          });

          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user && pathname === PASSWORD_UPDATE_PATH) {
    return redirectWithAuthCookies(request, response, PASSWORD_RESET_PATH);
  }

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return appendAuthCookies(NextResponse.redirect(loginUrl), response);
  }

  if (user && isGuestOnlyPath(pathname)) {
    const next = normalizeAuthRedirectPath(
      request.nextUrl.searchParams.get("next"),
    );

    return redirectWithAuthCookies(request, response, next);
  }

  if (user && pathname === "/") {
    return redirectWithAuthCookies(
      request,
      response,
      DEFAULT_AUTHENTICATED_PATH,
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
