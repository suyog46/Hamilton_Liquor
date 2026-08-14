import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    try {
      await fetch(`${process.env.SITE_API_URL}auth/logout`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });
    } catch {
      // Best-effort — clear local cookies regardless of backend result.
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("user_role");
  return response;
}
