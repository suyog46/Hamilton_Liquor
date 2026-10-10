"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatOrderDate,
  formatOrderMoney,
  fulfillmentLabel,
  fulfillmentSequence,
  getOrderScheduledEnd,
  getOrderScheduledStart,
  getRefundStatusLabel,
  getRefundStatusTone,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import type { FulfillmentEventType } from "@/redux/features/order/orderApiSlice";
import { useGetOrderQuery } from "@/redux/features/order/orderApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";
import { toast } from "sonner";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  useGetPaymentCheckoutStatusQuery,
  useResumePaymentMutation,
  useRetryPaymentMutation,
} from "@/redux/features/payment/paymentApiSlice";

const eventIcon: Record<FulfillmentEventType, string> = {
  PREPARING: "solar:chef-hat-linear",
  READY_FOR_PICKUP: "solar:bag-check-outline",
  PICKED_UP: "solar:check-circle-linear",
  READY_FOR_DELIVERY: "solar:box-linear",
  OUT_FOR_DELIVERY: "solar:delivery-outline",
  DELIVERED: "solar:check-circle-linear",
  REFUSED: "solar:close-circle-linear",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const router = useRouter();
  const {
    data: meData,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data, isLoading, isError, refetch } = useGetOrderQuery(orderId, {
    skip: !isLoggedIn || !orderId,
  });

  const payment = data?.data?.payment;
  const paymentStatus = payment?.status?.toUpperCase();
  const isPaymentPending = paymentStatus === "PENDING";
  const isRetryEligible = !!payment?.is_retry_eligible;
  const paymentId = payment?.id;

  const shouldCheckCheckoutStatus = isPaymentPending && !isRetryEligible && !!paymentId;
  const { data: checkoutStatusData } = useGetPaymentCheckoutStatusQuery(
    paymentId ?? "",
    {
      skip: !shouldCheckCheckoutStatus,
    },
  );

  const canResumePayment = checkoutStatusData?.data?.can_resume_payment === true;

  const [resumePayment, { isLoading: isResuming }] = useResumePaymentMutation();
  const [retryPayment, { isLoading: isRetrying }] = useRetryPaymentMutation();

  const handleResumePayment = async () => {
    if (!paymentId) return;
    try {
      const res = await resumePayment(paymentId).unwrap();
      if (res?.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        toast.error("Checkout link was not found. Please refresh.");
      }
    } catch (err) {
      const msg =
        isFetchBaseQueryError(err) &&
        typeof err.data === "object" &&
        err.data &&
        "message" in err.data
          ? String((err.data as any).message)
          : "Failed to resume payment. Please try again.";
      toast.error(msg);
    }
  };

  const handleRetryPayment = async () => {
    if (!paymentId) return;
    try {
      const res = await retryPayment(paymentId).unwrap();
      if (res?.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        toast.error("Checkout link was not found. Please refresh.");
      }
    } catch (err) {
      const msg =
        isFetchBaseQueryError(err) &&
        typeof err.data === "object" &&
        err.data &&
        "message" in err.data
          ? String((err.data as any).message)
          : "Failed to retry payment. Please try again.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (!isLoadingUser && (isUserError || !meData?.data)) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/order/${orderId}`)}`,
      );
    }
  }, [isLoadingUser, isUserError, meData, orderId, router]);

  if (isLoadingUser || (isLoggedIn && isLoading)) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-32">
        <Skeleton className="h-[650px] rounded-2xl" />
      </div>
    );
  }
  if (!isLoggedIn) return null;

  if (isError || !data?.data) {
    return (
      <>
        <PageBanner
          eyebrow="Order details"
          title="Order unavailable"
          breadcrumbs={[
            { name: "My Orders", href: "/order" },
            { name: "Order" },
          ]}
        />
        <section className="px-6 py-24 text-center">
          <Icon
            icon="solar:document-text-linear"
            className="mx-auto size-11 text-gray-300"
          />
          <p className="mt-4 font-semibold">
            We couldn&apos;t find or load this order.
          </p>
          <div className="mt-5 flex justify-center gap-4">
            <button
              onClick={() => refetch()}
              className="text-sm font-semibold text-gray-700 hover:text-black"
            >
              Try again
            </button>
            <Link href="/order" className="text-sm font-semibold text-gray-600">
              Back to orders
            </Link>
          </div>
        </section>
      </>
    );
  }

  const order = data.data;
  const sequence = fulfillmentSequence(order.fulfillment_method);
  const chronologicalEvents = [...order.fulfillment_events].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const eventsByType = new Map(
    chronologicalEvents.map((event) => [event.event_type, event]),
  );
  const currentIndex = sequence.indexOf(
    order.fulfillment_status as FulfillmentEventType,
  );
  const refusedEvent = chronologicalEvents.find(
    (event) => event.event_type === "REFUSED",
  );
  const scheduledStart = getOrderScheduledStart(order);
  const scheduledEnd = getOrderScheduledEnd(order);

  return (
    <>
      <PageBanner
        eyebrow="Order details"
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        breadcrumbs={[
          { name: "My Orders", href: "/order" },
          { name: `#${order.id.slice(-8).toUpperCase()}` },
        ]}
      />
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {isRetryEligible && (
              <div className="flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Icon icon="solar:danger-triangle-linear" className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900">
                      Payment retry available
                    </h3>
                    <p className="mt-0.5 text-xs text-amber-700">
                      The previous payment attempt was not completed. You can retry payment now to secure your order.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-normal px-5 py-2.5 text-xs font-bold text-black shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <Icon icon="svg-spinners:180-ring" className="size-4" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:restart-linear" className="size-4" />
                      Retry payment
                    </>
                  )}
                </button>
              </div>
            )}

            {!isRetryEligible && isPaymentPending && canResumePayment && (
              <div className="flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Icon icon="solar:card-2-linear" className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900">
                      Resume payment
                    </h3>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Your checkout session can be resumed. Click below to continue and complete your payment.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResumePayment}
                  disabled={isResuming}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-normal px-5 py-2.5 text-xs font-bold text-black shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
                >
                  {isResuming ? (
                    <>
                      <Icon icon="svg-spinners:180-ring" className="size-4" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:card-2-linear" className="size-4" />
                      Resume payment
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[order.status]}`}
                    >
                      {orderStatusLabel[order.status]}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {order.fulfillment_method === "PICKUP"
                        ? "Store pickup"
                        : "Delivery"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Placed {formatOrderDate(order.created_at)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-400">Current progress</p>
                  <p className="mt-1 font-semibold">
                    {fulfillmentLabel[order.fulfillment_status]}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <h2 className="font-title text-xl font-semibold">
                Fulfillment progress
              </h2>
              <div className="mt-7">
                <div className="relative flex gap-4 pb-8">
                  <div className="absolute left-5 top-10 h-[calc(100%-1.25rem)] w-px bg-emerald-200" />
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <Icon
                      icon="solar:clipboard-check-linear"
                      className="size-5"
                    />
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold">Order placed</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatOrderDate(order.created_at)}
                    </p>
                  </div>
                </div>

                {sequence.map((eventType, index) => {
                  const event = eventsByType.get(eventType);
                  const completed =
                    !!event ||
                    currentIndex > index ||
                    order.status === "FULFILLED";
                  const current = order.fulfillment_status === eventType;
                  const isLast = index === sequence.length - 1 && !refusedEvent;
                  return (
                    <div
                      key={eventType}
                      className={`relative flex gap-4 ${isLast ? "" : "pb-8"}`}
                    >
                      {!isLast && (
                        <div
                          className={`absolute left-5 top-10 h-[calc(100%-1.25rem)] w-px ${completed ? "bg-emerald-200" : "bg-gray-200"}`}
                        />
                      )}
                      <div
                        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border ${completed || current ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-300"}`}
                      >
                        <Icon icon={eventIcon[eventType]} className="size-5" />
                      </div>
                      <div className="pt-1">
                        <p
                          className={`font-semibold ${completed || current ? "text-black" : "text-gray-400"}`}
                        >
                          {fulfillmentLabel[eventType]}
                        </p>
                        {event ? (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatOrderDate(event.created_at)}
                          </p>
                        ) : current ? (
                          <p className="mt-1 text-xs font-medium text-emerald-700">
                            In progress
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-400">Pending</p>
                        )}
                        {event?.note && (
                          <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {refusedEvent && (
                  <div className="relative mt-8 flex gap-4">
                    <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
                      <Icon icon={eventIcon.REFUSED} className="size-5" />
                    </div>
                    <div className="pt-1">
                      <p className="font-semibold text-red-700">Refused</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatOrderDate(refusedEvent.created_at)}
                      </p>
                      {refusedEvent.refusal_reason && (
                        <p className="mt-2 text-sm text-red-700">
                          Reason:{" "}
                          {refusedEvent.refusal_reason
                            .replaceAll("_", " ")
                            .toLowerCase()}
                        </p>
                      )}
                      {refusedEvent.note && (
                        <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                          {refusedEvent.note}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {order.refund_history && order.refund_history.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/70">
                      <Icon icon="solar:restart-circle-linear" className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-title text-xl font-semibold">
                        Refund history
                      </h2>
                      <p className="text-xs text-gray-500">
                        {order.refund_history.length}{" "}
                        {order.refund_history.length === 1
                          ? "refund request"
                          : "refund requests"}{" "}
                        recorded
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {order.refund_history.map((refund, idx) => (
                    <div
                      key={refund.id || `${refund.requested_at}-${idx}`}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRefundStatusTone(
                                refund.status,
                              )}`}
                            >
                              {getRefundStatusLabel(
                                refund.status,
                                refund.status_label,
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              Requested {formatOrderDate(refund.requested_at)}
                            </span>
                          </div>
                          {refund.completed_at && (
                            <p className="text-xs text-gray-500">
                              Completed {formatOrderDate(refund.completed_at)}
                            </p>
                          )}
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs text-gray-400">Refund amount</p>
                          <p className="text-base font-bold text-gray-900">
                            {formatOrderMoney(
                              refund.amount,
                              refund.currency || order.currency,
                            )}
                          </p>
                        </div>
                      </div>

                      {refund.breakdown && (
                        <div className="mt-4 border-t border-gray-200/80 pt-3">
                          <p className="mb-2 text-xs font-semibold text-gray-600">
                            Refund Breakdown
                          </p>
                          <div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-3 text-xs sm:grid-cols-4">
                            <div>
                              <span className="text-gray-400">Merchandise</span>
                              <p className="font-semibold text-gray-800">
                                {formatOrderMoney(
                                  refund.breakdown.merchandise_refund,
                                  refund.currency || order.currency,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Delivery fee</span>
                              <p className="font-semibold text-gray-800">
                                {formatOrderMoney(
                                  refund.breakdown.delivery_refund,
                                  refund.currency || order.currency,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">
                                Cancellation fee
                              </span>
                              <p className="font-semibold text-gray-800">
                                {formatOrderMoney(
                                  refund.breakdown.cancellation_fee,
                                  refund.currency || order.currency,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Final refund</span>
                              <p className="font-semibold text-emerald-700">
                                {formatOrderMoney(
                                  refund.breakdown.final_refund,
                                  refund.currency || order.currency,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <h2 className="font-title text-xl font-semibold">Items</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {item.product_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.volume_ml}ml · Qty {item.quantity} ·{" "}
                        {formatOrderMoney(item.unit_price, order.currency)} each
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold">
                      {formatOrderMoney(item.line_total, order.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <h2 className="font-title text-lg font-semibold">
                Order summary
              </h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    {formatOrderMoney(order.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery fee</span>
                  <span>
                    {formatOrderMoney(order.delivery_fee, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-4 text-base font-bold">
                  <span>Total</span>
                  <span>{formatOrderMoney(order.total, order.currency)}</span>
                </div>
              </div>
              {order.payment && (
                <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      {isPaymentPending && (
                        <Icon icon="svg-spinners:180-ring" className="size-3 text-amber-600" />
                      )}
                      {order.payment.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>Provider</span>
                    <span>{order.payment.provider}</span>
                  </div>
                  {isRetryEligible ? (
                    <div className="mt-3 border-t border-gray-200/80 pt-3">
                      <button
                        type="button"
                        onClick={handleRetryPayment}
                        disabled={isRetrying}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-normal py-2 text-xs font-semibold text-black shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
                      >
                        {isRetrying ? (
                          <>
                            <Icon icon="svg-spinners:180-ring" className="size-3.5" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:restart-linear" className="size-3.5" />
                            Retry payment
                          </>
                        )}
                      </button>
                    </div>
                  ) : isPaymentPending && canResumePayment ? (
                    <div className="mt-3 border-t border-gray-200/80 pt-3">
                      <button
                        type="button"
                        onClick={handleResumePayment}
                        disabled={isResuming}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-normal py-2 text-xs font-semibold text-black shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
                      >
                        {isResuming ? (
                          <>
                            <Icon icon="svg-spinners:180-ring" className="size-3.5" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:card-2-linear" className="size-3.5" />
                            Resume payment
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
              {order.refund_history && order.refund_history.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-900">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Icon
                        icon="solar:restart-circle-linear"
                        className="size-4 text-amber-600"
                      />
                      Refund history
                    </span>
                    <span>
                      {order.refund_history.length}{" "}
                      {order.refund_history.length === 1 ? "record" : "records"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <div className="flex items-center gap-3">
                <Icon
                  icon={
                    order.fulfillment_method === "PICKUP"
                      ? "solar:bag-check-outline"
                      : "solar:delivery-outline"
                  }
                  className="size-6 text-emerald-700"
                />
                <h2 className="font-title text-lg font-semibold">
                  {order.fulfillment_method === "PICKUP"
                    ? "Pickup"
                    : "Delivery"}{" "}
                  details
                </h2>
              </div>
              <div className="mt-5 text-sm leading-6 text-gray-600">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Scheduled window
                </p>
                <p className="mt-1 font-semibold text-black">
                  {formatOrderDate(scheduledStart)}
                  {scheduledEnd
                    ? ` – ${new Date(scheduledEnd).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                    : ""}
                </p>
                {order.delivery ? (
                  <>
                    <p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Address
                    </p>
                    <p className="mt-1 font-medium text-black">
                      {order.delivery.recipient_first_name}{" "}
                      {order.delivery.recipient_last_name}
                    </p>
                    <p>{order.delivery.address_line1}</p>
                    {order.delivery.address_line2 && (
                      <p>{order.delivery.address_line2}</p>
                    )}
                    <p>
                      {order.delivery.city}, {order.delivery.state}{" "}
                      {order.delivery.zip_code}
                    </p>
                    {order.delivery.handoff_instructions && (
                      <>
                        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-400">
                          Handoff instructions
                        </p>
                        <p className="mt-1">
                          {order.delivery.handoff_instructions}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Location
                    </p>
                    <p className="mt-1">
                      Hamilton Liquor Store
                      <br />
                      5418 Harford Rd
                      <br />
                      Baltimore, MD 21214
                    </p>
                  </>
                )}
              </div>
            </div>

            <Link
              href="/order"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
              Back to all orders
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
