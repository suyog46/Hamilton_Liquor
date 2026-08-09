import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";

// Only "ADMIN" is confirmed from a real response; other roles are unknown,
// so this stays a plain string with "ADMIN" surfaced for autocomplete.
export type UserRole = "ADMIN" | (string & {});

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  is_email_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type CurrentUserResponse = ApiResponse<CurrentUser>;

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<CurrentUserResponse, void>({
      query: () => "auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery } = userApiSlice;
