import type {
  FulfillmentEventType,
  FulfillmentMethod,
  FulfillmentStatus,
  OrderStatus,
} from "@/redux/features/order/orderApiSlice";

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REFUSED: "Refused",
};

export const fulfillmentLabel: Record<FulfillmentStatus, string> = {
  PENDING: "Order placed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  READY_FOR_DELIVERY: "Ready for delivery",
  PICKED_UP: "Picked up",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  REFUSED: "Refused",
};

export const statusTone: Record<OrderStatus, string> = {
  PENDING: "border-primary-normal/40 bg-primary-normal/10 text-primary-active",
  CONFIRMED: "border-primary-normal/65 bg-primary-normal/20 text-black",
  FULFILLED: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50/70 text-red-700",
  REFUSED: "border-red-200 bg-red-50/70 text-red-700",
};

export const refundStatusTone: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  SUCCEEDED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REFUNDED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REFUND_PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  REFUND_FAILED: "border-red-200 bg-red-50 text-red-700",
  NO_REFUND_REQUIRED: "border-slate-200 bg-slate-100 text-slate-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-gray-200 bg-gray-50 text-gray-700",
};

export const getRefundStatusTone = (status?: string): string => {
  if (!status) return "border-gray-200 bg-gray-50 text-gray-700";
  return refundStatusTone[status.toUpperCase()] ?? "border-gray-200 bg-gray-50 text-gray-700";
};

export const getRefundCaseStatusLabel = (status?: string): string => {
  if (!status) return "Unknown";
  switch (status.toUpperCase()) {
    case "NO_REFUND_REQUIRED":
      return "No refund required";
    case "REFUND_PENDING":
      return "Refund pending";
    case "REFUNDED":
      return "Refunded";
    case "REFUND_FAILED":
      return "Refund failed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replaceAll("_", " ");
  }
};

export const getRefundCaseTypeLabel = (caseType?: string): string => {
  if (!caseType) return "Refund Case";
  switch (caseType.toUpperCase()) {
    case "CANCELLATION":
      return "Order Cancellation";
    case "RETURN":
      return "Return / Refund";
    default:
      return caseType.charAt(0).toUpperCase() + caseType.slice(1).toLowerCase().replaceAll("_", " ");
  }
};

export const getRefundReasonLabel = (reason?: string): string => {
  if (!reason) return "Not specified";
  const reasonMap: Record<string, string> = {
    RESERVATION_EXPIRED: "Reservation Expired",
    ORDER_REFUSED: "Order Refused",
    CUSTOMER_CANCELLED: "Customer Cancelled",
    STORE_CANCELLED: "Store Cancelled",
    ITEM_UNAVAILABLE: "Item Unavailable",
    DUPLICATE_PAYMENT: "Duplicate Payment",
    CUSTOMER_RETURN: "Customer Return",
    DAMAGED_ITEM: "Damaged Item",
    INCORRECT_ITEM: "Incorrect Item",
    MISSING_ITEM: "Missing Item",
    REFUSED_DELIVERY: "Refused Delivery",
    OTHER: "Other",
  };
  return reasonMap[reason.toUpperCase()] ?? reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase().replaceAll("_", " ");
};

export const getRefundStatusLabel = (status?: string, statusLabel?: string): string => {
  if (statusLabel && statusLabel.trim()) return statusLabel;
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replaceAll("_", " ");
};

export const formatOrderMoney = (value: string | number | null | undefined, currency = "USD") => {
  if (value === null || value === undefined || value === "") return "$0.00";
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return String(value);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

export const formatOrderDate = (value: string | null | undefined, includeTime = true) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime && { hour: "numeric", minute: "2-digit" }),
  });
};

export const fulfillmentSequence = (method: FulfillmentMethod): FulfillmentEventType[] =>
  method === "PICKUP"
    ? ["PREPARING", "READY_FOR_PICKUP", "PICKED_UP"]
    : ["PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED"];

export const getOrderScheduledStart = (order: {
  fulfillment_method: FulfillmentMethod;
  pickup_scheduled_start_at?: string | null;
  delivery?: {
    scheduled_start_at?: string | null;
    delivery_date?: string | null;
    scheduled_start_time?: string | null;
  } | null;
}): string | null => {
  if (order.fulfillment_method === "PICKUP") {
    return order.pickup_scheduled_start_at ?? null;
  }
  if (!order.delivery) return null;
  if (order.delivery.scheduled_start_at) return order.delivery.scheduled_start_at;
  if (order.delivery.delivery_date && order.delivery.scheduled_start_time) {
    const time = order.delivery.scheduled_start_time;
    const timeStr = time.includes("T") ? time.split("T")[1] : time;
    return `${order.delivery.delivery_date}T${timeStr}`;
  }
  return order.delivery.delivery_date || order.delivery.scheduled_start_time || null;
};

export const getOrderScheduledEnd = (order: {
  fulfillment_method: FulfillmentMethod;
  pickup_scheduled_end_at?: string | null;
  delivery?: {
    scheduled_end_at?: string | null;
    delivery_date?: string | null;
    scheduled_end_time?: string | null;
  } | null;
}): string | null => {
  if (order.fulfillment_method === "PICKUP") {
    return order.pickup_scheduled_end_at ?? null;
  }
  if (!order.delivery) return null;
  if (order.delivery.scheduled_end_at) return order.delivery.scheduled_end_at;
  if (order.delivery.delivery_date && order.delivery.scheduled_end_time) {
    const time = order.delivery.scheduled_end_time;
    const timeStr = time.includes("T") ? time.split("T")[1] : time;
    return `${order.delivery.delivery_date}T${timeStr}`;
  }
  return order.delivery.scheduled_end_at || order.delivery.scheduled_end_time || null;
};
