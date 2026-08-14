import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractAuthTokensFromHeaders } from "@/lib/api/authCookies";

// Proxy (formerly "middleware") always runs on the Node.js runtime in
// Next.js 16 — no runtime export needed (and it's actually disallowed here).
const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole = request.cookies.get("user_role")?.value?.toUpperCase();

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

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

export const config = {
  matcher: ["/admin/:path*"],
};
