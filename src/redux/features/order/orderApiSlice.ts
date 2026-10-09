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
  latitude?: string | null;
  longitude?: string | null;
  handoff_instructions: string | null;
  delivery_date?: string | null;
  scheduled_start_time?: string | null;
  scheduled_end_time?: string | null;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
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
  pickup_date?: string;
  pickup_start_time?: string;
  pickup_end_time?: string;
  delivery_date?: string;
  delivery_slot_id?: string;
  expected_checkout: CheckoutExpectedCheckoutInput;
}

export interface CheckoutPreviewRequest {
  items: CheckoutItemInput[];
  fulfillment_method: FulfillmentMethod;
  address_id?: string;
  handoff_instructions?: string;
  pickup_date?: string;
  pickup_start_time?: string;
  pickup_end_time?: string;
  delivery_date?: string;
  delivery_slot_id?: string;
}

export interface CheckoutPreviewLineItem {
  product_variant_id: string;
  quantity: number;
  regular_unit_price: string;
  sale_id: string | null;
  sale_percentage: string | null;
  sale_unit_price: string | null;
  unit_price: string;
  line_total: string;
  product_name: string;
  variant_name: string;
  sku: string;
  volume_ml: number;
  alcohol_percentage: string;
  available_quantity: number;
  is_available: boolean;
}

export interface ExpectedCheckoutItem {
  product_variant_id: string;
  quantity: number;
  regular_unit_price: string;
  sale_id: string | null;
  sale_percentage: string | null;
  sale_unit_price: string | null;
  unit_price: string;
  line_total: string;
}

export interface ExpectedCheckout {
  items: ExpectedCheckoutItem[];
  subtotal: string;
  delivery_fee: string;
  total: string;
  currency: string;
}

export interface CheckoutExpectedItemInput {
  product_variant_id: string;
  quantity: number;
  regular_unit_price: number;
  sale_id: string | null;
  sale_percentage: number | null;
  sale_unit_price: number | null;
  unit_price: number;
  line_total: number;
}

export interface CheckoutExpectedCheckoutInput {
  items: CheckoutExpectedItemInput[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
}

export interface CheckoutPreviewData {
  items: CheckoutPreviewLineItem[];
  expected_checkout: ExpectedCheckout;
  fulfillment_method: FulfillmentMethod;
  pickup_date: string | null;
  pickup_start_time: string | null;
  pickup_end_time: string | null;
  delivery_date: string | null;
  delivery_slot_id: string | null;
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

export type CancelOrderReason =
  | "CUSTOMER_CANCELLED"
  | "STORE_CANCELLED"
  | "ITEM_UNAVAILABLE"
  | "CUSTOMER_RETURN"
  | "DAMAGED_ITEM"
  | "INCORRECT_ITEM"
  | "MISSING_ITEM"
  | "REFUSED_DELIVERY"
  | "OTHER";

export type RefundReason = CancelOrderReason;

export type ItemCondition = "NOT_APPLICABLE" | "UNOPENED" | "OPENED" | "DAMAGED";
export type ItemDisposition = "NOT_RETURNED" | "RESELLABLE" | "DAMAGED";

export interface CancelOrderRequest {
  reason: CancelOrderReason;
  note?: string;
}

export interface ConfirmCancellationMutationRequest {
  order_id: string;
  body: CancelOrderRequest;
  idempotencyKey?: string;
}

export interface RefundCaseItemInput {
  order_item_id: string;
  quantity: number;
  condition: ItemCondition;
  disposition: ItemDisposition;
}

export interface CreateRefundCaseRequest {
  reason: RefundReason;
  items: RefundCaseItemInput[];
  note?: string;
}

export interface CreateRefundCaseMutationRequest {
  order_id: string;
  body: CreateRefundCaseRequest;
  idempotencyKey?: string;
}

export interface CancellationPreviewItem {
  order_item_id: string;
  product_variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  line_refund: string;
  condition: ItemCondition;
  disposition: ItemDisposition;
}

export interface CancellationPreviewData {
  order_id: string;
  case_type: string;
  eligible: boolean;
  items: CancellationPreviewItem[];
  merchandise_refund: string;
  delivery_refund: string;
  cancellation_fee: string;
  final_refund: string;
  currency: string;
}

export type CancellationPreviewResponse = ApiResponse<CancellationPreviewData>;
export type RefundCasePreviewResponse = ApiResponse<CancellationPreviewData>;

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
export type CheckoutPreviewResponse = ApiResponse<CheckoutPreviewData>;
export type OrdersResponse = ApiListResponse<Order>;
export type OrderResponse = ApiResponse<Order>;
export type GetOrdersParams = Pick<BaseGetListParams, "page" | "limit">;
export type AdminOrdersResponse = ApiListResponse<AdminOrder>;
export type AdminOrderResponse = ApiResponse<AdminOrder>;

export interface CheckoutMutationRequest {
  body: CheckoutRequest;
  idempotencyKey: string;
}

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
    previewCancellation: builder.mutation<CancellationPreviewResponse, { order_id: string; body: CancelOrderRequest }>({
      query: ({ order_id, body }) => ({
        url: `admin/orders/${order_id}/cancellation/preview`,
        method: "POST",
        body,
      }),
    }),
    confirmCancellation: builder.mutation<ApiResponse<void>, ConfirmCancellationMutationRequest>({
      query: ({ order_id, body, idempotencyKey }) => ({
        url: `admin/orders/${order_id}/cancellation`,
        method: "POST",
        headers: idempotencyKey
          ? {
              "Idempotency-Key": idempotencyKey,
            }
          : undefined,
        body,
      }),
      invalidatesTags: (_result, _error, { order_id }) => [
        { type: "Order", id: `ADMIN-${order_id}` },
        { type: "Order", id: "ADMIN-LIST" },
        { type: "Order", id: order_id },
      ],
    }),
    previewRefundCase: builder.mutation<RefundCasePreviewResponse, { order_id: string; body: CreateRefundCaseRequest }>({
      query: ({ order_id, body }) => ({
        url: `admin/orders/${order_id}/refund-cases/preview`,
        method: "POST",
        body,
      }),
    }),
    createRefundCase: builder.mutation<ApiResponse<void>, CreateRefundCaseMutationRequest>({
      query: ({ order_id, body, idempotencyKey }) => ({
        url: `admin/orders/${order_id}/refund-cases`,
        method: "POST",
        headers: idempotencyKey
          ? {
              "Idempotency-Key": idempotencyKey,
            }
          : undefined,
        body,
      }),
      invalidatesTags: (_result, _error, { order_id }) => [
        { type: "Order", id: `ADMIN-${order_id}` },
        { type: "Order", id: "ADMIN-LIST" },
        { type: "Order", id: order_id },
      ],
    }),
    checkout: builder.mutation<CheckoutResponse, CheckoutMutationRequest>({
      query: ({ body, idempotencyKey }) => ({
        url: "orders/checkout",
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body,
      }),
      invalidatesTags: ["Cart", { type: "Order", id: "LIST" }],
    }),
    checkoutPreview: builder.mutation<CheckoutPreviewResponse, CheckoutPreviewRequest>({
      query: (body) => ({
        url: "orders/checkout/preview",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderFulfillmentMutation,
  usePreviewCancellationMutation,
  useConfirmCancellationMutation,
  usePreviewRefundCaseMutation,
  useCreateRefundCaseMutation,
  useCheckoutMutation,
  useCheckoutPreviewMutation,
} = orderApiSlice;
