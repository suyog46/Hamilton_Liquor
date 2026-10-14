"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatOrderMoney,
  formatOrderNumber,
  fulfillmentLabel,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import { DashboardCatalogCards } from "@/components/Admin/Dashboard/DashboardCatalogCards";
import { DashboardErrorView } from "@/components/Admin/Dashboard/DashboardErrorView";
import { DashboardOrdersSection } from "@/components/Admin/Dashboard/DashboardOrdersSection";
import { DashboardRevenueCards } from "@/components/Admin/Dashboard/DashboardRevenueCards";
import { DashboardScheduleCards } from "@/components/Admin/Dashboard/DashboardScheduleCards";
import {
  formatGeneratedAt,
  formatStoreDate,
  parseDashboardError,
} from "@/lib/utils/dashboard";
import { useGetAdminDashboardQuery } from "@/redux/features/dashboard/dashboardApiSlice";
import { useGetAdminOrdersQuery } from "@/redux/features/order/orderApiSlice";

const quickLinks = [
  {
    name: "Add Product",
    href: "/admin/products",
    icon: "solar:add-circle-linear",
  },
  {
    name: "View Orders",
    href: "/admin/orders",
    icon: "solar:bag-check-linear",
  },
  {
    name: "Catalog Inventory",
    href: "/admin/inventory",
    icon: "solar:box-minimalistic-linear",
  },
  {
    name: "Create Categories",
    href: "/admin/categories",
    icon: "solar:bag-3-linear",
  },
  {
    name: "Delivery Slots",
    href: "/admin/delivery-slots",
    icon: "solar:delivery-linear",
  },
  {
    name: "Edit Store Hours",
    href: "/admin/store-hours",
    icon: "solar:clock-circle-linear",
  },
];

const RECENT_ORDERS_LIMIT = 5;

const AdminDashboardPage = () => {
  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetAdminDashboardQuery();

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useGetAdminOrdersQuery({ page: 1, limit: RECENT_ORDERS_LIMIT });

  const dashboardData = dashboardResponse?.data;
  const recentOrders = ordersData?.data.items ?? [];

  const parsedError = isDashboardError
    ? parseDashboardError(dashboardError)
    : null;

  const { formattedLocal, formattedStore, rawUtc } = formatGeneratedAt(
    dashboardData?.generated_at
  );
  const storeToday = formatStoreDate();

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
            <span className="rounded-full bg-primary-normal/15 px-2.5 py-0.5 text-[10px] font-semibold text-black border border-primary-normal/40">
              Store Metrics
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time operational and sales performance for Hamilton Liquor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Store Date Info */}
          <div className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground shadow-2xs">
            <Icon icon="solar:calendar-linear" className="size-3.5 text-primary-active" />
            <span>Store: <strong className="text-foreground font-semibold">{storeToday}</strong> (America/New_York)</span>
          </div>

          {/* Last Updated Timestamp & Refresh */}
          {dashboardData?.generated_at && (
            <div
              className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] text-muted-foreground shadow-2xs"
              title={`Generated at UTC: ${rawUtc} | Store Time: ${formattedStore}`}
            >
              <Icon icon="solar:clock-circle-linear" className="size-3.5 text-muted-foreground" />
              <span>
                Last updated:{" "}
                <strong className="text-foreground font-semibold">{formattedLocal}</strong>
              </span>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchDashboard()}
            disabled={isDashboardFetching}
            className="h-8 gap-1 text-xs"
            title="Refresh dashboard data"
          >
            <Icon
              icon="solar:restart-linear"
              className={`size-3.5 ${isDashboardFetching ? "animate-spin" : ""}`}
            />
            <span>{isDashboardFetching ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      {isDashboardError && parsedError ? (
        <DashboardErrorView
          error={parsedError}
          onRetry={refetchDashboard}
          isRetrying={isDashboardFetching}
        />
      ) : isDashboardLoading || !dashboardData ? (
        /* Loading Skeleton View */
        <div className="flex flex-col gap-6">
          {/* Revenue Skeletons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>

          {/* Schedule Skeletons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>

          {/* Orders Skeletons */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>

          {/* Catalog Skeletons */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        /* Loaded Dashboard View */
        <div className="flex flex-col gap-6">
          {/* 1. Revenue Metrics Section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Financial Overview
            </h2>
            <DashboardRevenueCards revenue={dashboardData.revenue} />
          </section>

          {/* 2. Schedule Operations (Today in America/New_York) */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Store Schedule (America/New_York)
            </h2>
            <DashboardScheduleCards schedule={dashboardData.schedule} />
          </section>

          {/* 3. Orders Overview & Fulfillment Backlog */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Orders &amp; Fulfillment Pipeline
            </h2>
            <DashboardOrdersSection orders={dashboardData.orders} />
          </section>

          {/* 4. Products & Customers */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Products Catalog &amp; Customers
            </h2>
            <DashboardCatalogCards
              products={dashboardData.products}
              customers={dashboardData.customers}
            />
          </section>
        </div>
      )}

      {/* Quick Navigation Links */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3.5 text-xs font-medium text-foreground transition-all hover:border-primary-normal hover:bg-gray-50 hover:shadow-2xs text-center"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-primary-normal/10 text-primary-active">
                <Icon icon={link.icon} className="size-4" />
              </div>
              <span className="line-clamp-1">{link.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders Table */}
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Latest transactions placed across all channels
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-primary-active hover:underline"
          >
            View all orders &rarr;
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          {isOrdersError ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Icon
                icon="solar:danger-circle-linear"
                className="size-6 text-destructive"
              />
              <p className="text-xs text-muted-foreground">
                Failed to load recent orders.
              </p>
              <Button size="sm" variant="secondary" onClick={() => refetchOrders()}>
                Try again
              </Button>
            </div>
          ) : isOrdersLoading ? (
            <div className="flex flex-col gap-2.5 px-4 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Icon
                icon="solar:bag-4-linear"
                className="size-6 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                No orders have been placed yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-4 font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-primary-active font-mono text-xs"
                      >
                        {formatOrderNumber(order)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium">{order.customer.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium">
                        {order.fulfillment_method === "PICKUP"
                          ? "Store Pickup"
                          : "Delivery"}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {fulfillmentLabel[order.fulfillment_status]}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {formatOrderMoney(order.total, order.currency)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <span
                        className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone[order.status]}`}
                      >
                        {orderStatusLabel[order.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
