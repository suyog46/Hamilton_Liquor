import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";

export interface MediaRef {
  id: string;
  url: string;
}

export interface ProductRef {
  id: string;
  name: string;
}

export interface CountryRef {
  id: string;
  name: string;
  flag: MediaRef;
}

export interface ProductVariant {
  id: string;
  volume_ml: number;
  price: string;
  alcohol_percentage: string;
  quantity: number;
  is_active: boolean;
  media: MediaRef;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  brand: ProductRef;
  country: CountryRef | null;
  category: ProductRef;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export type ProductResponse = ApiResponse<Product>;

export type ProductListResponse = ApiListResponse<Product>;

// The public storefront list endpoint (GET /products) returns a lightweight
// per-product summary instead of the full variants array — admin's list
// endpoint (GET /admin/products) is unaffected and still returns `Product`.
export interface PublicProductListItem {
  id: string;
  name: string;
  slug: string;
  category: ProductRef & { slug: string };
  brand: ProductRef & { slug: string };
  country: (CountryRef & { slug: string }) | null;
  thumbnail: MediaRef | null;
  starting_price: string;
  available_variant_volumes: number[];
  is_in_stock: boolean;
}

export type PublicProductListResponse = ApiListResponse<PublicProductListItem>;

export type GetProductsParams = BaseGetListParams<"name" | "created_at" | "updated_at">;

// Public storefront listing supports the same base params plus catalog filters.
export interface PublicGetProductsParams extends GetProductsParams {
  category?: string;
  brand?: string;
  country?: string;
  min_price?: number;
  max_price?: number;
  volume_ml?: number;
  in_stock?: boolean;
}

export interface CreateProductVariantInput {
  volume_ml: number;
  price: number;
  alcohol_percentage: number;
  quantity: number;
  media_id: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category_id: string;
  brand_id: string;
  country_id?: string;
  variants: CreateProductVariantInput[];
}

export interface UpdateProductRequest {
  product_id: string;
  name?: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  country_id?: string | null;
  is_active?: boolean;
}

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, GetProductsParams | void>({
      query: (params) => ({
        url: "admin/products",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProductDetail: builder.query<ProductResponse, string>({
      query: (productId) => `admin/products/${productId}`,
      providesTags: (_result, _error, productId) => [{ type: "Product", id: productId }],
    }),

    // Public storefront listing/detail — no admin/ prefix, no auth required.
    getPublicProducts: builder.query<PublicProductListResponse, PublicGetProductsParams | void>({
      query: (params) => ({
        url: "products",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product" as const, id: "PUBLIC_LIST" },
            ]
          : [{ type: "Product" as const, id: "PUBLIC_LIST" }],
    }),

    getPublicProductDetail: builder.query<ProductResponse, string>({
      query: (productId) => `products/${productId}`,
      providesTags: (_result, _error, productId) => [{ type: "Product", id: productId }],
    }),

    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({
        url: "admin/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation<ProductResponse, UpdateProductRequest>({
      query: ({ product_id, ...body }) => ({
        url: `admin/products/${product_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { product_id }) => [
        { type: "Product", id: product_id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `admin/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, productId) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailQuery,
  useGetPublicProductsQuery,
  useGetPublicProductDetailQuery,
  useLazyGetPublicProductDetailQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;
