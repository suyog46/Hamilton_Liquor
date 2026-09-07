import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";

export type SocialPlatform = "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "X";

export interface StoreInformation {
  id: string;
  primary_phone: string;
  secondary_phone: string | null;
  email: string;
  description: string | null;
}

export interface StoreLocation {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface OperatingHour {
  id: string;
  day_of_week: DayOfWeek;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export interface StoreInformationRequest {
  primary_phone?: string | null;
  secondary_phone?: string | null;
  email?: string | null;
  description?: string | null;
}

export interface StoreLocationRequest {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
}

export interface OperatingHoursRequest {
  hours: Array<{
    day_of_week: DayOfWeek;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }>;
}

export interface CreateSocialLinkRequest {
  platform: SocialPlatform;
  url: string;
}

export interface UpdateSocialLinkRequest {
  social_link_id: string;
  url: string;
}

export const storeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicStoreInformation: builder.query<
      ApiResponse<StoreInformation>,
      void
    >({
      query: () => "store/information",
      providesTags: [{ type: "Store", id: "PUBLIC-INFORMATION" }],
    }),
    getStoreInformation: builder.query<ApiResponse<StoreInformation>, void>({
      query: () => "admin/store/information",
      providesTags: [{ type: "Store", id: "INFORMATION" }],
    }),
    updateStoreInformation: builder.mutation<
      ApiResponse<StoreInformation>,
      StoreInformationRequest
    >({
      query: (body) => ({
        url: "admin/store/information",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "INFORMATION" }],
    }),

    getStoreLocation: builder.query<ApiResponse<StoreLocation>, void>({
      query: () => "admin/store/location",
      providesTags: [{ type: "Store", id: "LOCATION" }],
    }),
    getPublicStoreLocation: builder.query<ApiResponse<StoreLocation>, void>({
      query: () => "store/location",
      providesTags: [{ type: "Store", id: "PUBLIC-LOCATION" }],
    }),
    updateStoreLocation: builder.mutation<
      ApiResponse<StoreLocation>,
      StoreLocationRequest
    >({
      query: (body) => ({
        url: "admin/store/location",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "LOCATION" }],
    }),

    getOperatingHours: builder.query<
      ApiResponse<{ hours: OperatingHour[] }>,
      void
    >({
      query: () => "admin/store/operating-hours",
      providesTags: [{ type: "Store", id: "HOURS" }],
    }),
    getPublicOperatingHours: builder.query<
      ApiResponse<{ hours: OperatingHour[] }>,
      void
    >({
      query: () => "store/operating-hours",
      providesTags: [{ type: "Store", id: "PUBLIC-HOURS" }],
    }),
    updateOperatingHours: builder.mutation<
      ApiResponse<{ hours: OperatingHour[] }>,
      OperatingHoursRequest
    >({
      query: (body) => ({
        url: "admin/store/operating-hours",
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "HOURS" }],
    }),

    getSocialLinks: builder.query<ApiResponse<SocialLink[]>, void>({
      query: () => "admin/store/social-links",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Store" as const, id })),
              { type: "Store" as const, id: "SOCIAL-LINKS" },
            ]
          : [{ type: "Store" as const, id: "SOCIAL-LINKS" }],
    }),
    getPublicSocialLinks: builder.query<ApiResponse<SocialLink[]>, void>({
      query: () => "store/social-links",
      providesTags: [{ type: "Store", id: "PUBLIC-SOCIAL-LINKS" }],
    }),
    createSocialLink: builder.mutation<
      ApiResponse<SocialLink>,
      CreateSocialLinkRequest
    >({
      query: (body) => ({
        url: "admin/store/social-links",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "SOCIAL-LINKS" }],
    }),
    updateSocialLink: builder.mutation<
      ApiResponse<SocialLink>,
      UpdateSocialLinkRequest
    >({
      query: ({ social_link_id, ...body }) => ({
        url: `admin/store/social-links/${social_link_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "SOCIAL-LINKS" }],
    }),
    deleteSocialLink: builder.mutation<void, string>({
      query: (socialLinkId) => ({
        url: `admin/store/social-links/${socialLinkId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Store", id: "SOCIAL-LINKS" }],
    }),
  }),
});

export const {
  useGetStoreInformationQuery,
  useGetPublicStoreInformationQuery,
  useUpdateStoreInformationMutation,
  useGetStoreLocationQuery,
  useGetPublicStoreLocationQuery,
  useUpdateStoreLocationMutation,
  useGetOperatingHoursQuery,
  useGetPublicOperatingHoursQuery,
  useUpdateOperatingHoursMutation,
  useGetSocialLinksQuery,
  useGetPublicSocialLinksQuery,
  useCreateSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
} = storeApiSlice;
