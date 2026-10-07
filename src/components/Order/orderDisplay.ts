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

export const formatOrderMoney = (value: string, currency = "USD") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
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
