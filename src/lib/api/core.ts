import { cookies } from "next/headers";

export async function core(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(`${process.env.SITE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookieHeader,
    },
  });

  return response;
}