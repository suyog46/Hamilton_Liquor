export function extractAuthTokensFromHeaders(headers: Headers): {
  accessToken?: string;
  refreshToken?: string;
} {
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie") as string]
        : [];

  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  for (const cookie of setCookies) {
    const accessMatch = cookie.match(/^access_token=([^;]*)/);
    const refreshMatch = cookie.match(/^refresh_token=([^;]*)/);
    if (accessMatch) accessToken = decodeURIComponent(accessMatch[1]);
    if (refreshMatch) refreshToken = decodeURIComponent(refreshMatch[1]);
  }

  return { accessToken, refreshToken };
}
