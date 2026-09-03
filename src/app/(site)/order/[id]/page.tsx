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
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import type { FulfillmentEventType } from "@/redux/features/order/orderApiSlice";
import { useGetOrderQuery } from "@/redux/features/order/orderApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";

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
  const { data: meData, isLoading: isLoadingUser, isError: isUserError } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data, isLoading, isError, refetch } = useGetOrderQuery(orderId, { skip: !isLoggedIn || !orderId });

  useEffect(() => {
    if (!isLoadingUser && (isUserError || !meData?.data)) {
      router.replace(`/login?redirect=${encodeURIComponent(`/order/${orderId}`)}`);
    }
  }, [isLoadingUser, isUserError, meData, orderId, router]);

  if (isLoadingUser || (isLoggedIn && isLoading)) {
    return <div className="mx-auto max-w-6xl px-6 py-32"><Skeleton className="h-[650px] rounded-2xl" /></div>;
  }
  if (!isLoggedIn) return null;

  if (isError || !data?.data) {
    return (
      <>
        <PageBanner eyebrow="Order details" title="Order unavailable" breadcrumbs={[{ name: "My Orders", href: "/order" }, { name: "Order" }]} />
        <section className="px-6 py-24 text-center">
          <Icon icon="solar:document-text-linear" className="mx-auto size-11 text-gray-300" />
          <p className="mt-4 font-semibold">We couldn&apos;t find or load this order.</p>
          <div className="mt-5 flex justify-center gap-4"><button onClick={() => refetch()} className="text-sm font-semibold text-primary-active">Try again</button><Link href="/order" className="text-sm font-semibold text-gray-600">Back to orders</Link></div>
        </section>
      </>
    );
  }

  const order = data.data;
  const sequence = fulfillmentSequence(order.fulfillment_method);
  const chronologicalEvents = [...order.fulfillment_events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const eventsByType = new Map(chronologicalEvents.map((event) => [event.event_type, event]));
  const currentIndex = sequence.indexOf(order.fulfillment_status as FulfillmentEventType);
  const refusedEvent = chronologicalEvents.find((event) => event.event_type === "REFUSED");
  const scheduledStart = order.fulfillment_method === "PICKUP"
    ? order.pickup_scheduled_start_at
    : order.delivery?.scheduled_start_at;
  const scheduledEnd = order.fulfillment_method === "PICKUP"
    ? order.pickup_scheduled_end_at
    : order.delivery?.scheduled_end_at;

  return (
    <>
      <PageBanner eyebrow="Order details" title={`Order #${order.id.slice(-8).toUpperCase()}`} breadcrumbs={[{ name: "My Orders", href: "/order" }, { name: `#${order.id.slice(-8).toUpperCase()}` }]} />
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone[order.status]}`}>{orderStatusLabel[order.status]}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{order.fulfillment_method === "PICKUP" ? "Store pickup" : "Delivery"}</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Placed {formatOrderDate(order.created_at)}</p>
                </div>
                <div className="sm:text-right"><p className="text-xs text-gray-400">Current progress</p><p className="mt-1 font-semibold">{fulfillmentLabel[order.fulfillment_status]}</p></div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <h2 className="font-title text-xl font-semibold">Fulfillment progress</h2>
              <div className="mt-7">
                <div className="relative flex gap-4 pb-8">
                  <div className="absolute left-5 top-10 h-[calc(100%-1.25rem)] w-px bg-primary-normal" />
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-normal text-black"><Icon icon="solar:clipboard-check-linear" className="size-5" /></div>
                  <div className="pt-1"><p className="font-semibold">Order placed</p><p className="mt-1 text-xs text-gray-500">{formatOrderDate(order.created_at)}</p></div>
                </div>

                {sequence.map((eventType, index) => {
                  const event = eventsByType.get(eventType);
                  const completed = !!event || currentIndex > index || order.status === "FULFILLED";
                  const current = order.fulfillment_status === eventType;
                  const isLast = index === sequence.length - 1 && !refusedEvent;
                  return (
                    <div key={eventType} className={`relative flex gap-4 ${isLast ? "" : "pb-8"}`}>
                      {!isLast && <div className={`absolute left-5 top-10 h-[calc(100%-1.25rem)] w-px ${completed ? "bg-primary-normal" : "bg-gray-200"}`} />}
                      <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ${completed || current ? "bg-primary-normal text-black ring-primary-normal" : "bg-white text-gray-300 ring-gray-200"}`}><Icon icon={eventIcon[eventType]} className="size-5" /></div>
                      <div className="pt-1">
                        <p className={`font-semibold ${completed || current ? "text-black" : "text-gray-400"}`}>{fulfillmentLabel[eventType]}</p>
                        {event ? <p className="mt-1 text-xs text-gray-500">{formatOrderDate(event.created_at)}</p> : current ? <p className="mt-1 text-xs font-medium text-primary-active">In progress</p> : <p className="mt-1 text-xs text-gray-400">Pending</p>}
                        {event?.note && <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{event.note}</p>}
                      </div>
                    </div>
                  );
                })}

                {refusedEvent && (
                  <div className="relative mt-8 flex gap-4">
                    <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200"><Icon icon={eventIcon.REFUSED} className="size-5" /></div>
                    <div className="pt-1"><p className="font-semibold text-red-700">Refused</p><p className="mt-1 text-xs text-gray-500">{formatOrderDate(refusedEvent.created_at)}</p>{refusedEvent.refusal_reason && <p className="mt-2 text-sm text-red-700">Reason: {refusedEvent.refusal_reason.replaceAll("_", " ").toLowerCase()}</p>}{refusedEvent.note && <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{refusedEvent.note}</p>}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <h2 className="font-title text-xl font-semibold">Items</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-5 py-4">
                    <div><p className="text-sm font-semibold">{item.product_name}</p><p className="mt-1 text-xs text-gray-500">{item.volume_ml}ml · Qty {item.quantity} · {formatOrderMoney(item.unit_price, order.currency)} each</p></div>
                    <p className="shrink-0 text-sm font-bold">{formatOrderMoney(item.line_total, order.currency)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <h2 className="font-title text-lg font-semibold">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatOrderMoney(order.subtotal, order.currency)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery fee</span><span>{formatOrderMoney(order.delivery_fee, order.currency)}</span></div>
                <div className="flex justify-between border-t pt-4 text-base font-bold"><span>Total</span><span>{formatOrderMoney(order.total, order.currency)}</span></div>
              </div>
              {order.payment && <div className="mt-5 rounded-lg bg-gray-50 p-3 text-xs text-gray-600"><div className="flex justify-between"><span>Payment</span><span className="font-semibold">{order.payment.status}</span></div><div className="mt-2 flex justify-between"><span>Provider</span><span>{order.payment.provider}</span></div></div>}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <div className="flex items-center gap-3"><Icon icon={order.fulfillment_method === "PICKUP" ? "solar:bag-check-outline" : "solar:delivery-outline"} className="size-6 text-primary-active" /><h2 className="font-title text-lg font-semibold">{order.fulfillment_method === "PICKUP" ? "Pickup" : "Delivery"} details</h2></div>
              <div className="mt-5 text-sm leading-6 text-gray-600">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Scheduled window</p>
                <p className="mt-1 font-semibold text-black">{formatOrderDate(scheduledStart)}{scheduledEnd ? ` – ${new Date(scheduledEnd).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}</p>
                {order.delivery ? <><p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-400">Address</p><p className="mt-1 font-medium text-black">{order.delivery.recipient_first_name} {order.delivery.recipient_last_name}</p><p>{order.delivery.address_line1}</p>{order.delivery.address_line2 && <p>{order.delivery.address_line2}</p>}<p>{order.delivery.city}, {order.delivery.state} {order.delivery.zip_code}</p>{order.delivery.handoff_instructions && <><p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-400">Handoff instructions</p><p className="mt-1">{order.delivery.handoff_instructions}</p></>}</> : <><p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-400">Location</p><p className="mt-1">Hamilton Liquor Store<br />5418 Harford Rd<br />Baltimore, MD 21214</p></>}
              </div>
            </div>

            <Link href="/order" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-active"><Icon icon="solar:arrow-left-linear" className="size-4" />Back to all orders</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
