import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse, BaseGetListParams } from "@/redux/types/api";

export interface ContactMessage {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactMessageRequest {
  full_name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessagesListData {
  items: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  unread_count: number;
}

export type ContactMessagesResponse = ApiResponse<ContactMessagesListData>;
export type ContactMessageResponse = ApiResponse<ContactMessage>;

export type GetContactMessagesParams = BaseGetListParams<
  "full_name" | "created_at" | "updated_at"
> & {
  is_read?: boolean;
};

export const contactMessageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createContactMessage: builder.mutation<
      ContactMessageResponse,
      CreateContactMessageRequest
    >({
      query: (body) => ({
        url: "contact-messages",
        method: "POST",
        body,
      }),
    }),

    getAdminContactMessages: builder.query<
      ContactMessagesResponse,
      GetContactMessagesParams | void
    >({
      query: (params) => ({
        url: "admin/contact-messages",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({
                type: "ContactMessage" as const,
                id,
              })),
              { type: "ContactMessage" as const, id: "LIST" },
            ]
          : [{ type: "ContactMessage" as const, id: "LIST" }],
    }),

    getAdminContactMessage: builder.query<ContactMessageResponse, string>({
      query: (contactMessageId) =>
        `admin/contact-messages/${contactMessageId}`,
      providesTags: (_result, _error, contactMessageId) => [
        { type: "ContactMessage", id: contactMessageId },
      ],
    }),

    markContactMessageRead: builder.mutation<ContactMessageResponse, string>({
      query: (contactMessageId) => ({
        url: `admin/contact-messages/${contactMessageId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, contactMessageId) => [
        { type: "ContactMessage", id: contactMessageId },
        { type: "ContactMessage", id: "LIST" },
      ],
    }),

    markContactMessageUnread: builder.mutation<
      ContactMessageResponse,
      string
    >({
      query: (contactMessageId) => ({
        url: `admin/contact-messages/${contactMessageId}/unread`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, contactMessageId) => [
        { type: "ContactMessage", id: contactMessageId },
        { type: "ContactMessage", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateContactMessageMutation,
  useGetAdminContactMessagesQuery,
  useGetAdminContactMessageQuery,
  useMarkContactMessageReadMutation,
  useMarkContactMessageUnreadMutation,
} = contactMessageApiSlice;
