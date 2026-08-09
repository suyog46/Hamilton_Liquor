import { NextRequest, NextResponse } from "next/server";

// Shared by the /api/auth/* BFF routes that just relay a JSON body to the
// backend and reshape its error into { message } — signup, verify-email,
// resend-verification. Login/refresh/logout stay separate since they also
// have to read/set the httpOnly token cookies.
export async function forwardAuthRequest(req: NextRequest, backendPath: string, fallbackErrorMessage: string) {
  const body = await req.json();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_API_URL}${backendPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[auth/${backendPath}] fetch to backend failed:`, err);
    return NextResponse.json(
      { message: "Network error. Please check your connection and try again." },
      { status: 502 }
    );
  }

  let data: unknown = null;
  try {
    data = await backendRes.json();
  } catch {
    // Ignore — handled by the !backendRes.ok / missing-data checks below.
  }

  if (!backendRes.ok) {
    const errorData = data as { error?: { message?: string }; message?: string } | null;
    return NextResponse.json(
      { message: errorData?.error?.message ?? errorData?.message ?? fallbackErrorMessage },
      { status: backendRes.status }
    );
  }

  return NextResponse.json(data, { status: backendRes.status });
}
