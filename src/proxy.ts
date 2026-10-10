import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractAuthTokensFromHeaders } from "@/lib/api/authCookies";

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole = request.cookies.get("user_role")?.value?.toUpperCase();

  // 1. Topmost guard: Check tokens first
  if (!accessToken && !refreshToken) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Role guard (user is authenticated)
  if (userRole === "ADMIN") {
    // Admin is restricted to /admin routes only
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // Non-admin users are blocked from /admin routes
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. For /admin routes, verify access token or perform refresh
  if (pathname.startsWith("/admin")) {
    if (accessToken) return NextResponse.next();

    // Access token missing/expired but we have a refresh token — rotate it.
    try {
      const refreshRes = await fetch(`${process.env.SITE_API_URL}auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refresh_token=${refreshToken}`,
        },
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh failed");
      }

      let data: unknown = null;
      try {
        data = await refreshRes.json();
      } catch {
        // Tokens live in Set-Cookie — a successful response may have no body.
      }

      const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
        extractAuthTokensFromHeaders(refreshRes.headers);
      const bodyData = data as { data?: { access_token?: string; refresh_token?: string } } | null;
      const newAccessToken = cookieAccessToken ?? bodyData?.data?.access_token;
      const newRefreshToken = cookieRefreshToken ?? bodyData?.data?.refresh_token;

      if (!newAccessToken) {
        throw new Error("Refresh response missing access token");
      }

      const response = NextResponse.next();
      const isProduction = process.env.NODE_ENV === "production";

      response.cookies.set("access_token", newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      if (newRefreshToken) {
        response.cookies.set("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      return response;
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user_role");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - metadata and static asset files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
