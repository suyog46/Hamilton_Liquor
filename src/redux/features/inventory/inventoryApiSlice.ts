import { apiSlice } from "@/redux/apiSlice";
import type { ApiResponse, ListData } from "@/redux/types/api";

// Mirrors InventoryAdjustmentReason in the API's OpenAPI schema.
// Positive quantity_change: INITIAL_STOCK, PURCHASE, RETURN.
// Negative quantity_change: SALE, DAMAGED.
// MANUAL supports either direction.
export type InventoryAdjustmentReason =
  | "INITIAL_STOCK"
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGED"
  | "MANUAL";

export interface InventoryAdjustment {
  id: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: InventoryAdjustmentReason;
  note: string | null;
  created_at: string;
}

export type InventoryAdjustmentResponse = ApiResponse<InventoryAdjustment>;

export type InventoryAdjustmentListResponse = ApiResponse<ListData<InventoryAdjustment>>;

export interface CreateInventoryAdjustmentRequest {
  // Not part of the request body — kept here only so the mutation can
  // invalidate the right Product cache entry after adjusting.
  product_id: string;
  product_variant_id: string;
  quantity_change: number;
  reason: InventoryAdjustmentReason;
  note?: string;
}

export interface GetInventoryAdjustmentsParams {
  product_variant_id: string;
  page?: number;
  limit?: number;
}

export const inventoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adjustInventory: builder.mutation<
      InventoryAdjustmentResponse,
      CreateInventoryAdjustmentRequest
    >({
      query: ({ product_id: _product_id, ...body }) => ({
        url: "admin/inventory/adjustments",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { product_variant_id, product_id }) => [
        { type: "ProductVariant", id: product_variant_id },
        { type: "Product", id: product_id },
        { type: "InventoryAdjustment", id: product_variant_id },
      ],
    }),

    getInventoryAdjustments: builder.query<
      InventoryAdjustmentListResponse,
      GetInventoryAdjustmentsParams
    >({
      query: (params) => ({
        url: "admin/inventory/adjustments",
        params,
      }),
      providesTags: (_result, _error, { product_variant_id }) => [
        { type: "InventoryAdjustment", id: product_variant_id },
      ],
    }),
  }),
});

export const { useAdjustInventoryMutation, useGetInventoryAdjustmentsQuery } =
  inventoryApiSlice;
