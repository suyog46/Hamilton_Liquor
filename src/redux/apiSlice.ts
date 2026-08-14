import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

// Every request goes through our own Next.js server first (BFF pattern) —
// the browser never talks to the external API directly. The proxy route
// reads the httpOnly access_token cookie server-side and attaches it as a
// Bearer header, so there's no cross-site cookie/CORS concern here at all.
const baseQuery = fetchBaseQuery({
  baseUrl: "/api/proxy/",
  credentials: "include",
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((entry) => searchParams.append(key, String(entry)));
      } else {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString();
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && api.endpoint !== "login") {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // refresh_token is httpOnly and scoped to our own domain, so it can
        // only be read/rotated by our own route handler — not by fetching
        // the external API directly from the browser.
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          result = await baseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Category", "Brand", "Country", "Product", "ProductVariant", "InventoryAdjustment", "Cart", "User"],
  endpoints: () => ({}),
});
