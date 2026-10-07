import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";

export type SaleStatus = "scheduled" | "active" | "expired" | "cancelled";

export interface Sale {
  id: string;
  variant_id: string;
  base_price: string;
  percentage: string;
  sale_price: string;
  started_at: string;
  ended_at: string;
  status: SaleStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleVariant {
  id: string;
  sku: string;
  display_name: string;
  volume_ml: number;
  price: string;
}

export interface SaleProduct {
  id: string;
  name: string;
  slug: string;
}

export interface SaleListItem {
  sale: Sale;
  variant: SaleVariant;
  product: SaleProduct;
}

export interface GetSalesParams extends BaseGetListParams {
  status?: SaleStatus;
  start_date?: string;
  end_date?: string;
}

export interface CreateSaleRequest {
  variant_id: string;
  percentage: number;
  started_at: string;
  ended_at: string;
}

export interface UpdateSaleRequest {
  sale_id: string;
  started_at: string;
  ended_at: string;
}

export type SaleListResponse = ApiListResponse<SaleListItem>;
export type SaleResponse = ApiResponse<Sale>;

export const saleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<SaleListResponse, GetSalesParams | void>({
      query: (params) => ({
        url: "admin/sales",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ sale }) => ({ type: "Sale" as const, id: sale.id })),
              { type: "Sale" as const, id: "LIST" },
            ]
          : [{ type: "Sale" as const, id: "LIST" }],
    }),
    getSaleDetail: builder.query<SaleResponse, string>({
      query: (saleId) => `admin/sales/${saleId}`,
      providesTags: (_result, _error, saleId) => [{ type: "Sale", id: saleId }],
    }),
    createSale: builder.mutation<SaleResponse, CreateSaleRequest>({
      query: ({ variant_id, ...body }) => ({
        url: `admin/product-variants/${variant_id}/sale`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Sale", id: "LIST" }, { type: "Product", id: "LIST" }],
    }),
    updateSale: builder.mutation<SaleResponse, UpdateSaleRequest>({
      query: ({ sale_id, ...body }) => ({
        url: `admin/sales/${sale_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { sale_id }) => [
        { type: "Sale", id: sale_id },
        { type: "Sale", id: "LIST" },
      ],
    }),
    endSale: builder.mutation<SaleResponse, string>({
      query: (saleId) => ({
        url: `admin/sales/${saleId}/end`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, saleId) => [
        { type: "Sale", id: saleId },
        { type: "Sale", id: "LIST" },
      ],
    }),
    cancelSale: builder.mutation<SaleResponse, string>({
      query: (saleId) => ({
        url: `admin/sales/${saleId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, saleId) => [
        { type: "Sale", id: saleId },
        { type: "Sale", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleDetailQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useEndSaleMutation,
  useCancelSaleMutation,
} = saleApiSlice;
