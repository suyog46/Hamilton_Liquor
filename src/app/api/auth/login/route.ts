import { NextRequest, NextResponse } from "next/server";
import { extractAuthTokensFromHeaders } from "@/lib/api/authCookies";

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface MeResponse {
  data?: { role?: string };
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  let backendRes: Response;
  console.log("[auth/login] forwarding request to backend: and the env is ", body,process.env.NEXT_PUBLIC_SITE_API_URL);
  try {
    backendRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_API_URL}auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[auth/login] fetch to backend failed:", err);
    return NextResponse.json(
      { message: "Network error. Please check your connection and try again." },
      { status: 502 }
    );
  }

  let data: unknown = null;
  try {
    data = await backendRes.json();
  } catch {
    // Tokens live in Set-Cookie, so a successful response may have an
    // empty or non-JSON body — that's fine.
  }

  if (!backendRes.ok) {
    const errorData = data as { error?: { message?: string }; message?: string } | null;
    return NextResponse.json(
      { message: errorData?.error?.message ?? errorData?.message ?? "Invalid email or password." },
      { status: backendRes.status }
    );
  }

  // The backend returns tokens via Set-Cookie, not the JSON body.
  const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
    extractAuthTokensFromHeaders(backendRes.headers);

  const bodyData = data as { data?: { access_token?: string; refresh_token?: string } } | null;
  const accessToken = cookieAccessToken ?? bodyData?.data?.access_token;
  const refreshToken = cookieRefreshToken ?? bodyData?.data?.refresh_token;

  if (!accessToken || !refreshToken) {
    console.error(
      "[auth/login] 2xx response but no tokens found in Set-Cookie or body. Set-Cookie:",
      backendRes.headers.getSetCookie?.() ?? backendRes.headers.get("set-cookie"),
      "Body:",
      JSON.stringify(data)
    );
    return NextResponse.json(
      { message: "Unexpected response from authentication server." },
      { status: 502 }
    );
  }

  // Resolve the role server-side so the route guard can read it from an
  // httpOnly cookie on the very next navigation to /admin.
  let userRole = "UNKNOWN";
  try {
    const meResponse = await fetch(`${process.env.SITE_API_URL ?? process.env.NEXT_PUBLIC_SITE_API_URL}auth/me`, {
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
    if (meResponse.ok) {
      const meData = await meResponse.json() as MeResponse;
      userRole = meData.data?.role?.toUpperCase() ?? "UNKNOWN";
    }
  } catch {
    // Login remains valid; an unknown role simply cannot enter /admin.
  }

  const response = NextResponse.json({ success: true, role: userRole });

  const isProduction = process.env.NODE_ENV === "production";

  // Both tokens are httpOnly — only our own server (middleware + the BFF
  // proxy route) ever reads them. The browser never sees or forwards them
  // directly to the external API. See src/app/api/proxy/[...path]/route.ts.
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  // Never exposed to client JS; only read server-side (middleware / refresh route).
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  response.cookies.set("user_role", userRole, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return response;
}
