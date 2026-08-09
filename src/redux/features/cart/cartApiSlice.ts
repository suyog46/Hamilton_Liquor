import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";
import type { MediaRef } from "@/redux/features/product/productApiSlice";

export interface CartProductReference {
  id: string;
  name: string;
  slug: string;
}

export interface CartProductVariant {
  id: string;
  product: CartProductReference;
  volume_ml: number;
  price: string;
  alcohol_percentage: string;
  quantity: number;
  is_active: boolean;
  media: MediaRef;
}

export interface CartItem {
  id: string;
  quantity: number;
  product_variant: CartProductVariant;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export type CartResponse = ApiResponse<Cart>;

export interface AddToCartRequest {
  product_variant_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  item_id: string;
  quantity: number;
}

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => "cart",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<CartResponse, AddToCartRequest>({
      query: (body) => ({
        url: "cart/items",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<CartResponse, UpdateCartItemRequest>({
      query: ({ item_id, quantity }) => ({
        url: `cart/items/${item_id}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<CartResponse, string>({
      query: (itemId) => ({
        url: `cart/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: "cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApiSlice;
