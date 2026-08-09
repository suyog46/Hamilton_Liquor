import { NextRequest, NextResponse } from "next/server";

// Generic BFF proxy: every data request from the browser lands here first.
// We attach the (httpOnly, server-only) access token as a Bearer header and
// forward to the real backend — the browser never talks to
// api.hamiltonliquor.shop directly, so cross-site cookie/CORS rules never
// come into play.
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const accessToken = req.cookies.get("access_token")?.value;
console.log("[proxy] accessToken:", accessToken);
  console.log("[proxy] forwarding request to backend:", path.join("/"));

  const url = new URL(`${process.env.SITE_API_URL}${path.join("/")}`);
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("cookie");
  headers.delete("content-length");
  if (accessToken) {
  
    // headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Cookie", `access_token=${accessToken}`);
  } else {
    headers.delete("authorization");
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);

  console.log("[proxy] forwarding request to backend:", url.toString(), "method:", req.method, "hasBody:", hasBody);
  const backendRes = await fetch(url, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    // Required by undici when streaming a ReadableStream request body.
    ...(hasBody ? { duplex: "half" } : {}),
  } as RequestInit);

  console.log("[proxy] backend response status:", backendRes);
  const responseHeaders = new Headers();
  const contentType = backendRes.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
};
