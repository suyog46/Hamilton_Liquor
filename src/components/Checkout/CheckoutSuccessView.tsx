"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatOrderDate, formatOrderMoney, fulfillmentLabel } from "@/components/Order/orderDisplay";
import { apiSlice } from "@/redux/apiSlice";
import { useGetOrderQuery } from "@/redux/features/order/orderApiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useCartStore } from "@/lib/stores/cartStore";

interface CheckoutSuccessViewProps {
  orderId: string;
}

export default function CheckoutSuccessView({ orderId }: CheckoutSuccessViewProps) {
  const dispatch = useAppDispatch();
  const setCartCount = useCartStore((state) => state.setCount);
  const { data, isLoading, isError, refetch } = useGetOrderQuery(orderId, { skip: !orderId });

  useEffect(() => {
    setCartCount(0);
    dispatch(apiSlice.util.invalidateTags(["Cart", { type: "Order", id: "LIST" }]));
  }, [dispatch, setCartCount]);

  if (!orderId) {
    return (
      <>
        <PageBanner eyebrow="Checkout" title="Order unavailable" breadcrumbs={[{ name: "Checkout" }]} />
        <section className="px-6 py-24 text-center">
          <Icon icon="solar:danger-triangle-linear" className="mx-auto size-12 text-amber-500" />
          <h2 className="mt-4 font-title text-2xl font-semibold">Missing order information</h2>
          <p className="mt-2 text-sm text-gray-500">The checkout return link did not include an order ID.</p>
          <Link href="/order" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary-normal px-6 text-sm font-semibold text-black hover:bg-primary-hover">View my orders</Link>
        </section>
      </>
    );
  }

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-32"><Skeleton className="h-[580px] rounded-2xl" /></div>;
  }

  if (isError || !data?.data) {
    return (
      <>
        <PageBanner eyebrow="Payment received" title="Thank you" breadcrumbs={[{ name: "Checkout" }]} />
        <section className="px-6 py-24 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700"><Icon icon="solar:check-circle-bold" className="size-9" /></div>
          <h2 className="mt-5 font-title text-2xl font-semibold">Your payment was successful</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">We received your payment, but the order details are still loading.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4"><button onClick={() => refetch()} className="h-11 rounded-lg bg-primary-normal px-6 text-sm font-semibold text-black hover:bg-primary-hover">Try again</button><Link href="/order" className="inline-flex h-11 items-center rounded-lg border border-gray-200 px-6 text-sm font-semibold">View my orders</Link></div>
        </section>
      </>
    );
  }

  const order = data.data;
  const scheduledStart = order.fulfillment_method === "PICKUP" ? order.pickup_scheduled_start_at : order.delivery?.scheduled_start_at;
  const scheduledEnd = order.fulfillment_method === "PICKUP" ? order.pickup_scheduled_end_at : order.delivery?.scheduled_end_at;

  return (
    <>
      <PageBanner eyebrow="Payment successful" title="Thank you for your order" breadcrumbs={[{ name: "Checkout" }, { name: "Success" }]} />
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200 sm:p-10">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700"><Icon icon="solar:check-circle-bold" className="size-9" /></div>
            <h2 className="mt-5 font-title text-2xl font-semibold">Payment successful</h2>
            <p className="mt-2 text-sm text-gray-500">Your order has been placed and a confirmation is being prepared.</p>
            <p className="mt-4 text-sm font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
                <div><p className="text-xs uppercase tracking-wide text-gray-400">Fulfillment</p><p className="mt-1 font-semibold">{order.fulfillment_method === "PICKUP" ? "Store pickup" : "Delivery"}</p></div>
                <div className="text-right"><p className="text-xs uppercase tracking-wide text-gray-400">Status</p><p className="mt-1 font-semibold">{fulfillmentLabel[order.fulfillment_status]}</p></div>
              </div>

              <div className="grid gap-5 border-b border-gray-100 py-5 sm:grid-cols-2">
                <div><p className="text-xs uppercase tracking-wide text-gray-400">Scheduled window</p><p className="mt-1 text-sm font-semibold">{formatOrderDate(scheduledStart)}{scheduledEnd ? ` – ${new Date(scheduledEnd).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : ""}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-gray-400">Payment</p><p className="mt-1 text-sm font-semibold">{order.payment?.status ?? "Successful"}</p>{order.payment?.provider && <p className="mt-0.5 text-xs text-gray-500">Processed by {order.payment.provider}</p>}</div>
              </div>

              {order.delivery && (
                <div className="border-b border-gray-100 py-5 text-sm leading-6 text-gray-600">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Delivery address</p>
                  <p className="mt-1 font-semibold text-black">{order.delivery.recipient_first_name} {order.delivery.recipient_last_name}</p>
                  <p>{order.delivery.address_line1}{order.delivery.address_line2 ? `, ${order.delivery.address_line2}` : ""}<br />{order.delivery.city}, {order.delivery.state} {order.delivery.zip_code}</p>
                  {order.delivery.handoff_instructions && <p className="mt-3 rounded-lg bg-gray-50 p-3"><span className="font-semibold text-black">Handoff instructions:</span> {order.delivery.handoff_instructions}</p>}
                </div>
              )}

              <h3 className="mt-5 font-title text-lg font-semibold">Items</h3>
              <div className="mt-2 divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                    <div><p className="text-sm font-semibold">{item.product_name}</p><p className="mt-1 text-xs text-gray-500">{item.volume_ml}ml · Qty {item.quantity}</p></div>
                    <p className="shrink-0 text-sm font-bold">{formatOrderMoney(item.line_total, order.currency)}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-6">
              <h3 className="font-title text-lg font-semibold">Order total</h3>
              <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatOrderMoney(order.subtotal, order.currency)}</span></div><div className="flex justify-between"><span className="text-gray-500">Delivery fee</span><span>{formatOrderMoney(order.delivery_fee, order.currency)}</span></div><div className="flex justify-between border-t pt-4 text-base font-bold"><span>Total paid</span><span>{formatOrderMoney(order.total, order.currency)}</span></div></div>
              <div className="mt-6 flex flex-col gap-3"><Link href={`/order/${order.id}`} className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-normal px-5 text-sm font-semibold text-black hover:bg-primary-hover">Track this order</Link><Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-semibold hover:bg-gray-50">Continue shopping</Link></div>
              <div className="mt-5 flex gap-2 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600"><Icon icon="solar:shield-check-linear" className="mt-0.5 size-4 shrink-0 text-primary-active" />A valid government-issued photo ID is required at pickup or delivery.</div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
