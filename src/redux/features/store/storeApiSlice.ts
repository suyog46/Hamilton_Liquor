import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams, ListData } from "@/redux/types/api";

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

export interface DeliverySlot {
  id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  capacity: number;
  is_active: boolean;
}

export interface CreateDeliverySlotRequest {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  capacity: number;
  is_active?: boolean;
}

export interface UpdateDeliverySlotRequest {
  day_of_week?: DayOfWeek;
  start_time?: string;
  end_time?: string;
  capacity?: number;
  is_active?: boolean;
}

export interface GetAdminDeliverySlotsParams {
  page?: number;
  limit?: number;
  day_of_week?: DayOfWeek;
}

export interface DeliverySlotAvailability {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked: number;
  remaining: number;
  is_available: boolean;
}

export type DeliveryDateOption = "today" | "tomorrow";

export interface GetPublicDeliverySlotsParams {
  date: DeliveryDateOption;
  page?: number;
  limit?: number;
}

export interface CreateSocialLinkRequest {
  platform: SocialPlatform;
  url: string;
}

export interface UpdateSocialLinkRequest {
  social_link_id: string;
  url: string;
}

export interface StoreClosure {
  id: string;
  date: string; // e.g. "2026-10-07"
  name: string;
}

export interface GetStoreClosuresParams extends BaseGetListParams {
  year?: number | null;
  month?: number | null;
}

export interface CreateStoreClosureRequest {
  date: string;
  name: string;
}

export interface UpdateStoreClosureRequest {
  closure_id: string;
  date: string;
  name: string;
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

    getAdminDeliverySlots: builder.query<
      ApiListResponse<DeliverySlot>,
      GetAdminDeliverySlotsParams | void
    >({
      query: (params) => ({
        url: "admin/store/delivery-slots",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({
                type: "Store" as const,
                id: `DELIVERY-SLOT-${id}`,
              })),
              { type: "Store" as const, id: "DELIVERY-SLOTS" },
            ]
          : [{ type: "Store" as const, id: "DELIVERY-SLOTS" }],
    }),
    createDeliverySlot: builder.mutation<
      ApiResponse<DeliverySlot>,
      CreateDeliverySlotRequest
    >({
      query: (body) => ({
        url: "admin/store/delivery-slots",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "DELIVERY-SLOTS" }],
    }),
    updateDeliverySlot: builder.mutation<
      ApiResponse<DeliverySlot>,
      UpdateDeliverySlotRequest & { slot_id: string }
    >({
      query: ({ slot_id, ...body }) => ({
        url: `admin/store/delivery-slots/${slot_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { slot_id }) => [
        { type: "Store", id: `DELIVERY-SLOT-${slot_id}` },
        { type: "Store", id: "DELIVERY-SLOTS" },
      ],
    }),
    deleteDeliverySlot: builder.mutation<void, string>({
      query: (slotId) => ({
        url: `admin/store/delivery-slots/${slotId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Store", id: "DELIVERY-SLOTS" }],
    }),
    getPublicDeliverySlots: builder.query<
      ApiResponse<ListData<DeliverySlotAvailability> & { date: string }>,
      GetPublicDeliverySlotsParams
    >({
      query: ({ date, page, limit }) => ({
        url: "store/delivery-slots",
        params: { date, page, limit },
      }),
      providesTags: (_result, _error, { date }) => [
        { type: "Store", id: `PUBLIC-DELIVERY-SLOTS-${date}` },
      ],
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
    getStoreClosures: builder.query<
      ApiListResponse<StoreClosure>,
      GetStoreClosuresParams | void
    >({
      query: (params) => ({
        url: "admin/store/closures",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({
                type: "Store" as const,
                id: `CLOSURE-${id}`,
              })),
              { type: "Store" as const, id: "CLOSURES" },
            ]
          : [{ type: "Store" as const, id: "CLOSURES" }],
    }),
    createStoreClosure: builder.mutation<
      ApiResponse<StoreClosure>,
      CreateStoreClosureRequest
    >({
      query: (body) => ({
        url: "admin/store/closures",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "CLOSURES" }],
    }),
    updateStoreClosure: builder.mutation<
      ApiResponse<StoreClosure>,
      UpdateStoreClosureRequest
    >({
      query: ({ closure_id, ...body }) => ({
        url: `admin/store/closures/${closure_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Store", id: "CLOSURES" }],
    }),
    deleteStoreClosure: builder.mutation<void, string>({
      query: (closureId) => ({
        url: `admin/store/closures/${closureId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Store", id: "CLOSURES" }],
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
  useGetAdminDeliverySlotsQuery,
  useCreateDeliverySlotMutation,
  useUpdateDeliverySlotMutation,
  useDeleteDeliverySlotMutation,
  useGetPublicDeliverySlotsQuery,
  useGetSocialLinksQuery,
  useGetPublicSocialLinksQuery,
  useCreateSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useGetStoreClosuresQuery,
  useCreateStoreClosureMutation,
  useUpdateStoreClosureMutation,
  useDeleteStoreClosureMutation,
} = storeApiSlice;
