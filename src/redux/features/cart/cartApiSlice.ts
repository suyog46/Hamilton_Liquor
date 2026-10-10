import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse } from "@/redux/types/api";
import type { MediaRef } from "@/redux/features/product/productApiSlice";

export type CartVariantMedia = MediaRef;

export interface CartProductReference {
  id: string;
  name: string;
  slug: string;
}

export interface CartProductVariant {
  id: string;
  sku?: string;
  display_name?: string | null;
  product: CartProductReference;
  volume_ml: number;
  price: string;
  sale_price?: string | null;
  sale_percentage?: string | null;
  sale_started_at?: string | null;
  sale_ended_at?: string | null;
  has_sale?: boolean;
  alcohol_percentage: string;
  available_quantity: number;
  is_active: boolean;
  thumbnail: CartVariantMedia;
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

export interface AddToCartItemInput {
  product_variant_id: string;
  quantity: number;
}

export interface AddToCartRequest {
  items: AddToCartItemInput[];
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
      invalidatesTags: [
        "Cart",
        { type: "Product", id: "PUBLIC_LIST" },
        { type: "Sale", id: "PUBLIC_LIST" },
      ],
    }),

    updateCartItem: builder.mutation<CartResponse, UpdateCartItemRequest>({
      query: ({ item_id, quantity }) => ({
        url: `cart/items/${item_id}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: [
        { type: "Product", id: "PUBLIC_LIST" },
        { type: "Sale", id: "PUBLIC_LIST" },
      ],
    }),

    removeCartItem: builder.mutation<CartResponse, string>({
      query: (itemId) => ({
        url: `cart/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Cart",
        { type: "Product", id: "PUBLIC_LIST" },
        { type: "Sale", id: "PUBLIC_LIST" },
      ],
    }),

    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: "cart",
        method: "DELETE",
      }),
      invalidatesTags: [
        "Cart",
        { type: "Product", id: "PUBLIC_LIST" },
        { type: "Sale", id: "PUBLIC_LIST" },
      ],
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
