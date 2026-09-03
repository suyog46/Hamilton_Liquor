import { apiSlice } from "@/redux/apiSlice";
import type { ApiListResponse, ApiResponse, BaseGetListParams } from "@/redux/types/api";

export type FulfillmentMethod = "PICKUP" | "DELIVERY";
export type OrderStatus = "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED" | "REFUSED";
export type FulfillmentStatus =
  | "PENDING"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "READY_FOR_DELIVERY"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REFUSED";
export type FulfillmentEventType = Exclude<FulfillmentStatus, "PENDING">;

export interface OrderPayment {
  id: string;
  provider: string;
  status: string;
  amount: string;
  currency: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDelivery {
  id: string;
  user_address_id: string;
  recipient_first_name: string;
  recipient_last_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  handoff_instructions: string | null;
  scheduled_start_at: string;
  scheduled_end_at: string;
  created_at: string;
  updated_at: string;
}

export interface FulfillmentEvent {
  id: string;
  event_type: FulfillmentEventType;
  refusal_reason: string | null;
  note: string | null;
  performed_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_variant_id: string;
  product_name: string;
  volume_ml: number;
  unit_price: string;
  quantity: number;
  line_total: string;
  created_at: string;
}

export interface CheckoutItemInput {
  product_variant_id: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemInput[];
  fulfillment_method: FulfillmentMethod;
  address_id?: string;
  handoff_instructions?: string;
  pickup_scheduled_start_at?: string;
  pickup_scheduled_end_at?: string;
  delivery_scheduled_start_at?: string;
  delivery_scheduled_end_at?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  fulfillment_method: FulfillmentMethod;
  fulfillment_status: FulfillmentStatus;
  subtotal: string;
  delivery_fee: string;
  total: string;
  currency: string;
  payment: OrderPayment | null;
  pickup_scheduled_start_at: string | null;
  pickup_scheduled_end_at: string | null;
  delivery: OrderDelivery | null;
  fulfillment_events: FulfillmentEvent[];
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AdminOrder extends Order {
  customer: OrderCustomer;
}

export type DeliveryRefusalReason = "ID_INVALID" | "CUSTOMER_INTOXICATED" | "CUSTOMER_REFUSED" | "OTHER";

export interface UpdateFulfillmentRequest {
  order_id: string;
  fulfillment_status: FulfillmentStatus;
  refusal_reason: DeliveryRefusalReason | null;
  note: string;
}

export interface CheckoutData {
  order: Order;
  checkout_url: string;
}

export type CheckoutResponse = ApiResponse<CheckoutData>;
export type OrdersResponse = ApiListResponse<Order>;
export type OrderResponse = ApiResponse<Order>;
export type GetOrdersParams = Pick<BaseGetListParams, "page" | "limit">;
export type AdminOrdersResponse = ApiListResponse<AdminOrder>;
export type AdminOrderResponse = ApiResponse<AdminOrder>;

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<OrdersResponse, GetOrdersParams | void>({
      query: (params) => ({ url: "orders", params: params ?? undefined }),
      providesTags: (result) => result
        ? [
            ...result.data.items.map(({ id }) => ({ type: "Order" as const, id })),
            { type: "Order" as const, id: "LIST" },
          ]
        : [{ type: "Order" as const, id: "LIST" }],
    }),
    getOrder: builder.query<OrderResponse, string>({
      query: (orderId) => `orders/${orderId}`,
      providesTags: (_result, _error, orderId) => [{ type: "Order", id: orderId }],
    }),
    getAdminOrders: builder.query<AdminOrdersResponse, GetOrdersParams | void>({
      query: (params) => ({ url: "admin/orders", params: params ?? undefined }),
      providesTags: (result) => result
        ? [...result.data.items.map(({ id }) => ({ type: "Order" as const, id: `ADMIN-${id}` })), { type: "Order" as const, id: "ADMIN-LIST" }]
        : [{ type: "Order" as const, id: "ADMIN-LIST" }],
    }),
    getAdminOrder: builder.query<AdminOrderResponse, string>({
      query: (orderId) => `admin/orders/${orderId}`,
      providesTags: (_result, _error, orderId) => [{ type: "Order", id: `ADMIN-${orderId}` }],
    }),
    updateOrderFulfillment: builder.mutation<AdminOrderResponse, UpdateFulfillmentRequest>({
      query: ({ order_id, ...body }) => ({ url: `admin/orders/${order_id}/fulfillment`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, { order_id }) => [
        { type: "Order", id: `ADMIN-${order_id}` },
        { type: "Order", id: "ADMIN-LIST" },
        { type: "Order", id: order_id },
      ],
    }),
    checkout: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: "orders/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart", { type: "Order", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderFulfillmentMutation,
  useCheckoutMutation,
} = orderApiSlice;
