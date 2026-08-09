import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";
import type { MediaRef } from "@/redux/features/product/productApiSlice";

export interface Category {
  id: string;
  name: string;
  slug: string;
  media: MediaRef | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryResponse = ApiResponse<Category>;

export type CategoryListResponse = ApiListResponse<Category>;

export type GetCategoriesParams = BaseGetListParams<"name" | "created_at" | "updated_at">;

export interface CreateCategoryRequest {
  name: string;
  media_id: string;
}

export interface UpdateCategoryRequest {
  category_id: string;
  name: string;
  media_id?: string;
}

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryListResponse, GetCategoriesParams | void>({
      query: (params) => ({
        url: "admin/categories",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    // Public storefront listing — no admin/ prefix, no auth required.
    getPublicCategories: builder.query<CategoryListResponse, GetCategoriesParams | void>({
      query: (params) => ({
        url: "categories",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category" as const, id: "PUBLIC_LIST" },
            ]
          : [{ type: "Category" as const, id: "PUBLIC_LIST" }],
    }),

    getCategoryDetail: builder.query<CategoryResponse, string>({
      query: (categoryId) => `admin/categories/${categoryId}`,
      providesTags: (_result, _error, categoryId) => [
        { type: "Category", id: categoryId },
      ],
    }),

    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (body) => ({
        url: "admin/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: builder.mutation<CategoryResponse, UpdateCategoryRequest>({
      query: ({ category_id, ...body }) => ({
        url: `admin/categories/${category_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { category_id }) => [
        { type: "Category", id: category_id },
        { type: "Category", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (categoryId) => ({
        url: `admin/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, categoryId) => [
        { type: "Category", id: categoryId },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetPublicCategoriesQuery,
  useGetCategoryDetailQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
