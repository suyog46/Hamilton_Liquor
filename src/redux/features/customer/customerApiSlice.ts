import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  is_email_verified: boolean;
  created_at: string;
  order_count: number;
  last_order_at: string | null;
  net_spent: string;
  currency: string;
}

export type CustomerSortBy =
  | "created_at"
  | "name"
  | "email"
  | "order_count"
  | "net_spent"
  | "last_order_at";

export interface GetCustomersParams extends BaseGetListParams<CustomerSortBy> {}

export type GetCustomersResponse = ApiListResponse<CustomerListItem>;

export interface CustomerSummary {
  order_count: number;
  order_counts_by_status: Record<string, number>;
  first_order_at: string | null;
  last_order_at: string | null;
  captured_amount: string;
  refunded_amount: string;
  pending_refund_amount: string;
  net_spent: string;
  currency: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  is_email_verified: boolean;
  created_at: string;
  summary: CustomerSummary;
}

export type GetCustomerDetailResponse = ApiResponse<CustomerDetail>;

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<GetCustomersResponse, GetCustomersParams | void>({
      query: (params) => ({
        url: "admin/customers",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({
                type: "Customer" as const,
                id,
              })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    getCustomerDetail: builder.query<GetCustomerDetailResponse, string>({
      query: (customerId) => `admin/customers/${customerId}`,
      providesTags: (_result, _error, customerId) => [
        { type: "Customer", id: customerId },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerDetailQuery,
  useLazyGetCustomerDetailQuery,
} = customerApiSlice;
