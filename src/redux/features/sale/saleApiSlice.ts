import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";
import type { MediaLatestRef, MediaRef } from "@/redux/features/product/productApiSlice";

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

export interface GetVariantSalesParams extends BaseGetListParams {
  variant_id: string;
  status?: SaleStatus;
}

export type VariantSaleListResponse = ApiListResponse<Sale>;

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

export interface PublicSaleProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail?: MediaRef | null;
}

export interface PublicSaleVariant {
  id: string;
  sku: string;
  display_name: string;
  volume_ml: number;
  alcohol_percentage: string;
  is_liquor?: boolean;
  price: string;
  sale_price: string;
  sale_percentage: string;
  available_quantity: number;
  media?: MediaLatestRef[];
  thumbnail?: MediaRef | null;
}

export interface PublicSaleItem {
  product: PublicSaleProduct;
  variant: PublicSaleVariant;
  ended_at?: string;
  sale_end_at?: string;
  started_at?: string;
}

export type PublicSaleListResponse = ApiListResponse<PublicSaleItem>;

export const saleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSales: builder.query<PublicSaleListResponse, BaseGetListParams | void>({
      query: (params) => ({
        url: "sales",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map((item) => ({
                type: "Sale" as const,
                id: item.variant.id,
              })),
              { type: "Sale" as const, id: "PUBLIC_LIST" },
            ]
          : [{ type: "Sale" as const, id: "PUBLIC_LIST" }],
    }),
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
    getVariantSales: builder.query<VariantSaleListResponse, GetVariantSalesParams>({
      query: ({ variant_id, ...params }) => ({
        url: `admin/product-variants/${variant_id}/sales`,
        params,
      }),
      providesTags: (result, _err, { variant_id }) =>
        result
          ? [
              ...result.data.items.map((sale) => ({ type: "Sale" as const, id: sale.id })),
              { type: "Sale" as const, id: `VARIANT-${variant_id}` },
            ]
          : [{ type: "Sale" as const, id: `VARIANT-${variant_id}` }],
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
      invalidatesTags: [
        { type: "Sale", id: "LIST" },
        { type: "Sale", id: "PUBLIC_LIST" },
        { type: "Product", id: "LIST" },
      ],
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
        { type: "Sale", id: "PUBLIC_LIST" },
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
        { type: "Sale", id: "PUBLIC_LIST" },
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
        { type: "Sale", id: "PUBLIC_LIST" },
      ],
    }),
  }),
});

export const {
  useGetPublicSalesQuery,
  useGetSalesQuery,
  useGetVariantSalesQuery,
  useGetSaleDetailQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useEndSaleMutation,
  useCancelSaleMutation,
} = saleApiSlice;
