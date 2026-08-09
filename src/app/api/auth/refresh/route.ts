import { NextRequest, NextResponse } from "next/server";
import { extractAuthTokensFromHeaders } from "@/lib/api/authCookies";

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token." }, { status: 401 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${process.env.SITE_API_URL}auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });
  } catch {
    return NextResponse.json({ message: "Network error." }, { status: 502 });
  }

  if (!backendRes.ok) {
    const response = NextResponse.json({ message: "Session expired." }, { status: 401 });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  let data: unknown = null;
  try {
    data = await backendRes.json();
  } catch {
    // Tokens live in Set-Cookie — a successful response may have no body.
  }

  const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
    extractAuthTokensFromHeaders(backendRes.headers);
  const bodyData = data as { data?: { access_token?: string; refresh_token?: string } } | null;
  const accessToken = cookieAccessToken ?? bodyData?.data?.access_token;
  const newRefreshToken = cookieRefreshToken ?? bodyData?.data?.refresh_token;

  if (!accessToken) {
    const response = NextResponse.json({ message: "Session expired." }, { status: 401 });
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const response = NextResponse.json({ success: true });
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("access_token", accessToken, {
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
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  return response;
}
