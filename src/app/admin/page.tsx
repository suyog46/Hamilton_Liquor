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
  formatOrderDate,
  formatOrderMoney,
  fulfillmentLabel,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
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
    name: "Create Coupon",
    href: "/admin/coupons",
    icon: "solar:tag-price-linear",
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
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useGetAdminDashboardQuery();
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useGetAdminOrdersQuery({ page: 1, limit: RECENT_ORDERS_LIMIT });

  const stats = dashboardData?.data;
  const recentOrders = ordersData?.data.items ?? [];

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatOrderMoney(stats.total_revenue) : "—",
      icon: "solar:wallet-money-linear",
    },
    {
      label: "Orders",
      value: stats ? stats.total_orders.toLocaleString() : "—",
      icon: "solar:bag-check-linear",
    },
    {
      label: "Customers",
      value: stats ? stats.total_customers.toLocaleString() : "—",
      icon: "solar:users-group-rounded-linear",
    },
    {
      label: "Products",
      value: stats ? stats.total_products.toLocaleString() : "—",
      icon: "solar:box-linear",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Overview of your store&apos;s performance.
        </p>
      </div>

      {isDashboardError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon
              icon="solar:danger-circle-linear"
              className="size-6 text-destructive"
            />
            <p className="text-xs text-muted-foreground">
              Failed to load dashboard stats.
            </p>
            <Button size="sm" variant="secondary" onClick={() => refetchDashboard()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isDashboardLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            : statCards.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-normal text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon
                      icon={stat.icon}
                      className="h-4 w-4 text-primary-normal"
                    />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 ring-1 ring-foreground/10 bg-card text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            <Icon icon={link.icon} className="h-5 w-5 text-primary-normal" />
            {link.name}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-primary-normal hover:opacity-80"
          >
            View all &rarr;
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
            <div className="px-4">
              <Skeleton className="h-64 w-full" />
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
                        className="hover:text-primary-active"
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p>{order.customer.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {order.fulfillment_method === "PICKUP"
                        ? "Pickup"
                        : "Delivery"}
                      <p className="text-[11px] text-muted-foreground">
                        {fulfillmentLabel[order.fulfillment_status]}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatOrderMoney(order.total, order.currency)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <span
                        className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusTone[order.status]}`}
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
