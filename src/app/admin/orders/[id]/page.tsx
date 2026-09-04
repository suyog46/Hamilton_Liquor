"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatOrderDate,
  formatOrderMoney,
  fulfillmentLabel,
  fulfillmentSequence,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type DeliveryRefusalReason,
  type FulfillmentEventType,
  type FulfillmentStatus,
  useGetAdminOrderQuery,
  useUpdateOrderFulfillmentMutation,
} from "@/redux/features/order/orderApiSlice";

const refusalReasons: Array<{ value: DeliveryRefusalReason; label: string }> = [
  { value: "ID_INVALID", label: "Invalid ID" },
  { value: "CUSTOMER_INTOXICATED", label: "Customer intoxicated" },
  { value: "CUSTOMER_REFUSED", label: "Customer refused order" },
  { value: "OTHER", label: "Other" },
];

const errorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error))
    return "Failed to update fulfillment status.";
  const data = error.data as
    | { error?: { message?: string }; message?: string }
    | undefined;
  return (
    data?.error?.message ??
    data?.message ??
    "Failed to update fulfillment status."
  );
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetAdminOrderQuery(id);
  const order = data?.data;
  const [status, setStatus] = useState<FulfillmentStatus>("PENDING");
  const [refusalReason, setRefusalReason] = useState<
    DeliveryRefusalReason | ""
  >("");
  const [note, setNote] = useState("");
  const [updateFulfillment, { isLoading: isUpdating }] =
    useUpdateOrderFulfillmentMutation();

  useEffect(() => {
    if (order) setStatus(order.fulfillment_status);
  }, [order]);

  const allowedStatuses = useMemo<FulfillmentStatus[]>(() => {
    if (!order) return ["PENDING"];
    return order.fulfillment_method === "PICKUP"
      ? ["PENDING", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "REFUSED"]
      : [
          "PENDING",
          "PREPARING",
          "READY_FOR_DELIVERY",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
          "REFUSED",
        ];
  }, [order]);

  const saveStatus = async () => {
    if (status === "REFUSED" && !refusalReason) {
      toast.error("Choose a refusal reason.");
      return;
    }
    try {
      await updateFulfillment({
        order_id: id,
        fulfillment_status: status,
        refusal_reason:
          status === "REFUSED"
            ? (refusalReason as DeliveryRefusalReason)
            : null,
        note: note.trim(),
      }).unwrap();
      toast.success("Fulfillment status updated.");
      setNote("");
      if (status !== "REFUSED") setRefusalReason("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (isLoading) return <Skeleton className="h-[680px] w-full" />;
  if (isError || !order) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 border bg-card text-center">
        <Icon
          icon="solar:danger-circle-linear"
          className="size-8 text-destructive"
        />
        <p className="text-sm font-semibold">Couldn&apos;t load this order.</p>
        <div className="flex gap-4">
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold text-primary-active"
          >
            Try again
          </button>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-muted-foreground"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const sequence = fulfillmentSequence(order.fulfillment_method);
  const events = [...order.fulfillment_events].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const eventByType = new Map(events.map((event) => [event.event_type, event]));
  const refused = events.find((event) => event.event_type === "REFUSED");
  const currentIndex = sequence.indexOf(
    order.fulfillment_status as FulfillmentEventType,
  );
  const scheduledStart =
    order.fulfillment_method === "PICKUP"
      ? order.pickup_scheduled_start_at
      : order.delivery?.scheduled_start_at;
  const scheduledEnd =
    order.fulfillment_method === "PICKUP"
      ? order.pickup_scheduled_end_at
      : order.delivery?.scheduled_end_at;

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        description={`Placed ${formatOrderDate(order.created_at)} by ${order.customer.name}`}
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <Icon icon="solar:arrow-left-linear" className="size-4" />
            All orders
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <section className="border bg-card p-5 ring-1 ring-foreground/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${statusTone[order.status]}`}
                >
                  {orderStatusLabel[order.status]}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium">
                  {order.fulfillment_method === "PICKUP"
                    ? "Pickup"
                    : "Delivery"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">
                  Current progress
                </p>
                <p className="text-sm font-semibold">
                  {fulfillmentLabel[order.fulfillment_status]}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Customer</p>
                <p className="mt-1 text-sm font-semibold">
                  {order.customer.name}
                </p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-xs text-primary-active"
                >
                  {order.customer.email}
                </a>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">
                  Scheduled window
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatOrderDate(scheduledStart)}
                </p>
                {scheduledEnd && (
                  <p className="text-xs text-muted-foreground">
                    until {formatOrderDate(scheduledEnd)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Payment</p>
                <p className="mt-1 text-sm font-semibold">
                  {order.payment?.status ?? "Unavailable"}
                </p>
                {order.payment && (
                  <p className="text-xs text-muted-foreground">
                    {order.payment.provider}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="border bg-card p-5 ring-1 ring-foreground/5">
            <h2 className="text-sm font-semibold">Fulfillment history</h2>
            <div className="mt-5 space-y-0">
              <div className="relative flex gap-3 pb-6">
                <span className="absolute left-3 top-6 h-full w-px bg-primary-normal" />
                <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-normal">
                  <Icon icon="solar:check-read-linear" className="size-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Order placed</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatOrderDate(order.created_at)}
                  </p>
                </div>
              </div>
              {sequence.map((eventType, index) => {
                const event = eventByType.get(eventType);
                const complete =
                  !!event ||
                  currentIndex > index ||
                  order.status === "FULFILLED";
                return (
                  <div
                    key={eventType}
                    className="relative flex gap-3 pb-6 last:pb-0"
                  >
                    {index < sequence.length - 1 && (
                      <span
                        className={`absolute left-3 top-6 h-full w-px ${complete ? "bg-primary-normal" : "bg-border"}`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ${complete ? "bg-primary-normal ring-primary-normal" : "bg-card text-muted-foreground ring-border"}`}
                    >
                      <Icon
                        icon={
                          complete
                            ? "solar:check-read-linear"
                            : "solar:clock-circle-linear"
                        }
                        className="size-3.5"
                      />
                    </span>
                    <div>
                      <p
                        className={`text-xs font-semibold ${complete ? "" : "text-muted-foreground"}`}
                      >
                        {fulfillmentLabel[eventType]}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {event
                          ? formatOrderDate(event.created_at)
                          : order.fulfillment_status === eventType
                            ? "In progress"
                            : "Pending"}
                      </p>
                      {event?.note && (
                        <p className="mt-2 bg-gray-100 p-2 text-xs">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {refused && (
                <div className="mt-6 flex gap-3 text-destructive">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                    <Icon
                      icon="solar:close-circle-linear"
                      className="size-3.5"
                    />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Refused</p>
                    <p className="mt-0.5 text-[11px]">
                      {formatOrderDate(refused.created_at)}
                    </p>
                    {refused.refusal_reason && (
                      <p className="mt-1 text-xs">
                        Reason:{" "}
                        {refused.refusal_reason
                          .replaceAll("_", " ")
                          .toLowerCase()}
                      </p>
                    )}
                    {refused.note && (
                      <p className="mt-2 bg-destructive/5 p-2 text-xs">
                        {refused.note}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="border bg-card p-5 ring-1 ring-foreground/5">
            <h2 className="text-sm font-semibold">Order items</h2>
            <div className="mt-3 divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-xs font-semibold">{item.product_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.volume_ml}ml · {item.quantity} ×{" "}
                      {formatOrderMoney(item.unit_price, order.currency)}
                    </p>
                  </div>
                  <p className="text-xs font-semibold">
                    {formatOrderMoney(item.line_total, order.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="ml-auto mt-4 max-w-xs space-y-2 border-t pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatOrderMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>
                  {formatOrderMoney(order.delivery_fee, order.currency)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span>Total</span>
                <span>{formatOrderMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          {order.delivery && (
            <section className="border bg-card p-5 text-xs ring-1 ring-foreground/5">
              <h2 className="text-sm font-semibold">Delivery details</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Recipient and address</p>
                  <p className="mt-1 font-semibold">
                    {order.delivery.recipient_first_name}{" "}
                    {order.delivery.recipient_last_name}
                  </p>
                  <p className="mt-1 leading-5">
                    {order.delivery.address_line1}
                    <br />
                    {order.delivery.address_line2 && (
                      <>
                        {order.delivery.address_line2}
                        <br />
                      </>
                    )}
                    {order.delivery.city}, {order.delivery.state}{" "}
                    {order.delivery.zip_code}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Handoff instructions</p>
                  <p className="mt-1 leading-5">
                    {order.delivery.handoff_instructions ||
                      "No instructions provided."}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit border bg-card p-5 ring-1 ring-foreground/5 xl:sticky xl:top-20">
          <h2 className="text-sm font-semibold">Update fulfillment</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            This creates a fulfillment event visible to the customer.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Fulfillment status
              </label>
              <Select
                items={allowedStatuses.map((value) => ({
                  value,
                  label: fulfillmentLabel[value],
                }))}
                value={status}
                onValueChange={(value) => value && setStatus(value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((value) => (
                    <SelectItem key={value} value={value}>
                      {fulfillmentLabel[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {status === "REFUSED" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Refusal reason
                </label>
                <Select
                  items={refusalReasons}
                  value={refusalReason || null}
                  onValueChange={(value) => setRefusalReason(value ?? "")}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Choose a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {refusalReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label
                htmlFor="fulfillment-note"
                className="mb-1.5 block text-xs font-medium"
              >
                Note
              </label>
              <Textarea
                id="fulfillment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder="Add a description or update for the customer"
                className="min-h-28 resize-none"
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {note.length}/500
              </p>
            </div>
            <Button
              onClick={saveStatus}
              disabled={isUpdating}
              className="w-full bg-primary-normal text-black hover:bg-primary-hover"
            >
              {isUpdating && (
                <Icon icon="svg-spinners:180-ring" className="size-4" />
              )}
              Update status
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
