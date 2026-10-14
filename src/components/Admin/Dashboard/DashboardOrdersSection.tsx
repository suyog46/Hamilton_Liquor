"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderStatusLabel, statusTone } from "@/components/Order/orderDisplay";
import type { DashboardOrders } from "@/redux/features/dashboard/dashboardApiSlice";

interface DashboardOrdersSectionProps {
  orders: DashboardOrders;
}

const statusOrder = [
  "PENDING",
  "CONFIRMED",
  "FULFILLED",
  "CANCELLED",
  "REFUSED",
] as const;

const fulfillmentStages = [
  { key: "PENDING", label: "Order Placed", icon: "solar:clock-circle-linear", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "PREPARING", label: "Preparing", icon: "solar:box-linear", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: "solar:bag-check-linear", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery", icon: "solar:scooter-linear", tone: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "solar:delivery-linear", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
] as const;

export function DashboardOrdersSection({ orders }: DashboardOrdersSectionProps) {
  const totalBacklog = Object.values(orders.fulfillment_backlog).reduce(
    (acc, val) => acc + (val || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Orders Overview & Status Breakdown */}
      <Card className="shadow-xs flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">Orders Overview</CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Breakdown across all lifecycles
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary-active hover:underline"
            >
              View all orders &rarr;
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-gray-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {orders.total.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Counts every order, including unpaid checkouts
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-normal/15 text-primary-active">
                <Icon icon="solar:bag-3-linear" className="size-5" />
              </div>
            </div>

            {/* By Status Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-1">
                <span>Status Breakdown</span>
                <span>Count</span>
              </div>
              <div className="divide-y rounded-lg border bg-card text-xs">
                {statusOrder.map((statusKey) => {
                  const count = orders.by_status[statusKey] ?? 0;
                  const label = orderStatusLabel[statusKey] ?? statusKey;
                  const toneClass = statusTone[statusKey] ?? "";
                  const percentage =
                    orders.total > 0
                      ? Math.round((count / orders.total) * 100)
                      : 0;

                  return (
                    <Link
                      key={statusKey}
                      href={`/admin/orders?status=${statusKey}`}
                      className="flex items-center justify-between px-3 py-2.5 transition-colors hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneClass}`}
                        >
                          {label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          ({percentage}%)
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {count.toLocaleString()}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Card className="shadow-xs flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">
                  Fulfillment Backlog
                </CardTitle>
                <span className="rounded-full bg-primary-normal/20 px-2 py-0.5 text-[10px] font-bold text-black border border-primary-normal/40">
                  {totalBacklog} Active
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Paid (CONFIRMED) orders still being fulfilled, by stage
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary-active hover:underline"
            >
              Fulfill orders &rarr;
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {fulfillmentStages.map((stage) => {
                const count = orders.fulfillment_backlog[stage.key] ?? 0;

                return (
                  <div
                    key={stage.key}
                    className="flex items-center justify-between rounded-lg border bg-card p-2.5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex size-8 items-center justify-center rounded-md border ${stage.tone}`}
                      >
                        <Icon icon={stage.icon} className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {stage.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {stage.key === "PENDING"
                            ? "Awaiting preparation"
                            : stage.key === "PREPARING"
                              ? "Being packed in store"
                              : stage.key === "READY_FOR_PICKUP"
                                ? "Customer notified for pickup"
                                : stage.key === "READY_FOR_DELIVERY"
                                  ? "Staged for courier dispatch"
                                  : "With driver in transit"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">
                        {count.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-muted-foreground">in queue</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
