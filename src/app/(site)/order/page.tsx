"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatOrderDate,
  formatOrderMoney,
  fulfillmentLabel,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import { useGetOrdersQuery } from "@/redux/features/order/orderApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: meData, isLoading: isLoadingUser, isError: isUserError } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data, isLoading, isFetching, isError, refetch } = useGetOrdersQuery(
    { page, limit },
    { skip: !isLoggedIn },
  );

  useEffect(() => {
    if (!isLoadingUser && (isUserError || !meData?.data)) router.replace("/login?redirect=/order");
  }, [isLoadingUser, isUserError, meData, router]);

  if (isLoadingUser || (isLoggedIn && isLoading)) {
    return <div className="mx-auto max-w-6xl px-6 py-32"><Skeleton className="h-[520px] rounded-2xl" /></div>;
  }
  if (!isLoggedIn) return null;

  const orders = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  return (
    <>
      <PageBanner eyebrow="Your account" title="My Orders" breadcrumbs={[{ name: "My Orders" }]} />
      <section className="min-h-[520px] bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-7">
            <h2 className="font-title text-2xl font-semibold">Order history</h2>
            <p className="mt-1 text-sm text-gray-500">View fulfillment progress, scheduled handoff, and order details.</p>
          </div>

          {isError ? (
            <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-200">
              <Icon icon="solar:danger-triangle-linear" className="mx-auto size-10 text-red-400" />
              <p className="mt-3 font-semibold">We couldn&apos;t load your orders.</p>
              <button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-primary-active">Try again</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-gray-200">
              <Icon icon="solar:bag-4-linear" className="mx-auto size-11 text-gray-300" />
              <h2 className="mt-4 font-title text-xl font-semibold">No orders yet</h2>
              <p className="mt-2 text-sm text-gray-500">Your completed checkouts will appear here.</p>
              <Link href="/shop" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary-normal px-6 text-sm font-semibold text-black hover:bg-primary-hover">Start shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const schedule = order.fulfillment_method === "PICKUP"
                  ? order.pickup_scheduled_start_at
                  : order.delivery?.scheduled_start_at;
                return (
                  <Link key={order.id} href={`/order/${order.id}`} className="group block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary-normal sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone[order.status]}`}>{orderStatusLabel[order.status]}</span>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{order.fulfillment_method === "PICKUP" ? "Pickup" : "Delivery"}</span>
                        </div>
                        <p className="mt-4 text-sm font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="mt-1 text-xs text-gray-500">Placed {formatOrderDate(order.created_at)}</p>
                      </div>
                      <div className="grid flex-1 gap-4 border-t pt-5 sm:max-w-2xl sm:grid-cols-3 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                        <div><p className="text-xs text-gray-400">Progress</p><p className="mt-1 text-sm font-semibold">{fulfillmentLabel[order.fulfillment_status]}</p></div>
                        <div><p className="text-xs text-gray-400">Scheduled</p><p className="mt-1 text-sm font-semibold">{formatOrderDate(schedule)}</p></div>
                        <div className="flex items-end justify-between sm:block"><div><p className="text-xs text-gray-400">Total</p><p className="mt-1 text-base font-bold">{formatOrderMoney(order.total, order.currency)}</p></div><Icon icon="solar:alt-arrow-right-linear" className="size-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-primary-active sm:mt-2" /></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div className="mt-8 rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <DataTablePagination page={pagination.page} limit={pagination.limit} totalPages={pagination.total_pages} totalItems={pagination.total_items} hasNext={pagination.has_next} hasPrevious={pagination.has_previous} disabled={isFetching} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
