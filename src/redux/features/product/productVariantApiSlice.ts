import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";
import type { MediaRef } from "@/redux/features/product/productApiSlice";

export interface VariantMedia {
  id: string;
  display_order: number;
  media: MediaRef;
}

export interface ProductVariantDetail {
  id: string;
  product_id: string;
  volume_ml: number;
  price: string;
  alcohol_percentage: string;
  quantity: number;
  is_active: boolean;
  media: VariantMedia[];
  created_at: string;
  updated_at: string;
}

export type ProductVariantDetailResponse = ApiResponse<ProductVariantDetail>;

export interface VariantMediaInput {
  media_id: string;
  display_order: number;
}

export interface CreateProductVariantRequest {
  product_id: string;
  volume_ml: number;
  price: number;
  alcohol_percentage: number;
  quantity: number;
  media: VariantMediaInput[];
}

export interface UpdateProductVariantRequest {
  variant_id: string;
  product_id: string;
  volume_ml?: number;
  price?: number;
  alcohol_percentage?: number;
  quantity?: number;
  is_active?: boolean;
  media?: VariantMediaInput[];
}

export interface DeleteProductVariantRequest {
  variant_id: string;
  product_id: string;
}

export const productVariantApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductVariantDetail: builder.query<ProductVariantDetailResponse, string>({
      query: (variantId) => `admin/product-variants/${variantId}`,
      providesTags: (_result, _error, variantId) => [
        { type: "ProductVariant", id: variantId },
      ],
    }),

    createProductVariant: builder.mutation<
      ProductVariantDetailResponse,
      CreateProductVariantRequest
    >({
      query: ({ product_id, ...body }) => ({
        url: `admin/products/${product_id}/variants`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { product_id }) => [
        { type: "Product", id: product_id },
      ],
    }),

    updateProductVariant: builder.mutation<
      ProductVariantDetailResponse,
      UpdateProductVariantRequest
    >({
      query: ({ variant_id, product_id: _product_id, ...body }) => ({
        url: `admin/product-variants/${variant_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { variant_id, product_id }) => [
        { type: "ProductVariant", id: variant_id },
        { type: "Product", id: product_id },
      ],
    }),

    deleteProductVariant: builder.mutation<void, DeleteProductVariantRequest>({
      query: ({ variant_id }) => ({
        url: `admin/product-variants/${variant_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { variant_id, product_id }) => [
        { type: "ProductVariant", id: variant_id },
        { type: "Product", id: product_id },
      ],
    }),
  }),
});

export const {
  useGetProductVariantDetailQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productVariantApiSlice;
