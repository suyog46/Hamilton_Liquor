import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";


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

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<CurrentUserResponse, void>({
      query: () => "auth/me",
      providesTags: ["User"],
    }),
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "auth/change-password",
        method: "PATCH",
        body,
      }),
    }),
    deleteMe: builder.mutation<void, void>({
      query: () => ({
        url: "auth/me",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
  useDeleteMeMutation,
} = userApiSlice;
