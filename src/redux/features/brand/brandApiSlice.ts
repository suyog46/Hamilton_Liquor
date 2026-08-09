import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";
import type { MediaRef } from "@/redux/features/product/productApiSlice";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  media: MediaRef | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BrandResponse = ApiResponse<Brand>;

export type BrandListResponse = ApiListResponse<Brand>;

export type GetBrandsParams = BaseGetListParams<"name" | "created_at" | "updated_at">;

export interface CreateBrandRequest {
  name: string;
  description: string;
  media_id?: string;
}

export interface UpdateBrandRequest {
  brand_id: string;
  name: string;
  description: string;
  media_id?: string;
}

export const brandApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<BrandListResponse, GetBrandsParams | void>({
      query: (params) => ({
        url: "admin/brands",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Brand" as const, id })),
              { type: "Brand" as const, id: "LIST" },
            ]
          : [{ type: "Brand" as const, id: "LIST" }],
    }),

    // Public storefront listing — no admin/ prefix, no auth required.
    getPublicBrands: builder.query<BrandListResponse, GetBrandsParams | void>({
      query: (params) => ({
        url: "brands",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Brand" as const, id })),
              { type: "Brand" as const, id: "PUBLIC_LIST" },
            ]
          : [{ type: "Brand" as const, id: "PUBLIC_LIST" }],
    }),

    getBrandDetail: builder.query<BrandResponse, string>({
      query: (brandId) => `admin/brands/${brandId}`,
      providesTags: (_result, _error, brandId) => [{ type: "Brand", id: brandId }],
    }),

    createBrand: builder.mutation<BrandResponse, CreateBrandRequest>({
      query: (body) => ({
        url: "admin/brands",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
    }),

    updateBrand: builder.mutation<BrandResponse, UpdateBrandRequest>({
      query: ({ brand_id, ...body }) => ({
        url: `admin/brands/${brand_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { brand_id }) => [
        { type: "Brand", id: brand_id },
        { type: "Brand", id: "LIST" },
      ],
    }),

    deleteBrand: builder.mutation<void, string>({
      query: (brandId) => ({
        url: `admin/brands/${brandId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, brandId) => [
        { type: "Brand", id: brandId },
        { type: "Brand", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetPublicBrandsQuery,
  useGetBrandDetailQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApiSlice;
