"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCustomerDate,
  formatCustomerMoney,
  getCustomerInitials,
} from "@/lib/utils/customer";
import { orderStatusLabel, statusTone } from "@/components/Order/orderDisplay";
import { useGetCustomerDetailQuery } from "@/redux/features/customer/customerApiSlice";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = (params?.id as string) || "";
  const [copiedId, setCopiedId] = useState(false);

  const { data, isLoading, isError, isFetching, refetch } =
    useGetCustomerDetailQuery(customerId, {
      skip: !customerId,
    });

  const customer = data?.data;
  const summary = customer?.summary;

  const handleCopyId = () => {
    if (!customer?.id) return;
    navigator.clipboard.writeText(customer.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground w-fit"
        >
          <Icon icon="solar:arrow-left-linear" className="size-4" />
          Back to Customers
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center max-w-md mx-auto">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Icon icon="solar:danger-triangle-bold" className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Failed to Load Customer</h2>
              <p className="text-xs text-muted-foreground mt-1">
                The customer account could not be retrieved or does not exist.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" variant="default" onClick={() => refetch()} className="text-xs">
                <Icon icon="solar:restart-linear" className="mr-1.5 size-3.5" />
                Try again
              </Button>
              <Link
                href="/admin/customers"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                Return to List
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !customer || !summary) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const initials = getCustomerInitials(customer.name);
  const statusCounts = summary.order_counts_by_status || {};
  const statusEntries = Object.entries(statusCounts);

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon icon="solar:arrow-left-linear" className="size-4" />
          Back to Customers
        </Link>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1.5 text-xs"
        >
          <Icon
            icon="solar:restart-linear"
            className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {/* Customer Profile Header Card */}
      <Card className="relative overflow-hidden border-border bg-gradient-to-br from-card via-card to-primary-normal/5 shadow-xs">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary-normal/10 blur-2xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-16 ring-2 ring-primary-normal/30 shadow-xs">
                <AvatarFallback className="bg-primary-normal/20 text-lg font-bold text-primary-active">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    {customer.name || "Unnamed Customer"}
                  </h1>
                  {customer.is_email_verified ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]"
                    >
                      <Icon icon="solar:check-circle-bold" className="mr-1 size-3 text-emerald-600" />
                      Email Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-amber-700 text-[10px]"
                    >
                      <Icon icon="solar:danger-circle-bold" className="mr-1 size-3 text-amber-600" />
                      Unverified Email
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                  >
                    <Icon icon="solar:letter-linear" className="size-3.5" />
                    {customer.email}
                  </a>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon icon="solar:calendar-linear" className="size-3.5" />
                    Joined {formatCustomerDate(customer.created_at)}
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary-active"
                    title="Click to copy Customer ID"
                  >
                    <Icon icon={copiedId ? "solar:check-read-linear" : "solar:copy-linear"} className="size-3.5" />
                    ID: {customer.id.slice(0, 8)}...
                    {copiedId && <span className="text-emerald-600 font-sans text-[10px]">Copied</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                className={buttonVariants({
                  size: "sm",
                  variant: "default",
                  className: "bg-primary-normal hover:bg-primary-hover text-black shadow-xs",
                })}
              >
                <Icon icon="solar:bag-check-linear" className="mr-1.5 size-4" />
                View Customer Orders
              </Link>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics Cards */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Financial Summary
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Net Spent */}
          <Card className="relative overflow-hidden border-primary-normal/30 bg-gradient-to-br from-card via-card to-primary-normal/5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Lifetime Net Spent
              </CardTitle>
              <div className="flex size-7 items-center justify-center rounded-md bg-primary-normal/15 text-primary-active">
                <Icon icon="solar:wallet-money-bold" className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCustomerMoney(summary.net_spent, summary.currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total captured amount minus refunds
              </p>
            </CardContent>
          </Card>

          {/* Captured Amount */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Gross Captured
              </CardTitle>
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <Icon icon="solar:card-send-linear" className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCustomerMoney(summary.captured_amount, summary.currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total gross payments received
              </p>
            </CardContent>
          </Card>

          {/* Refunded Amount */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Refunded Amount
              </CardTitle>
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <Icon icon="solar:card-recive-linear" className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCustomerMoney(summary.refunded_amount, summary.currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Completed customer refunds
              </p>
            </CardContent>
          </Card>

          {/* Pending Refund Amount */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Pending Refunds
              </CardTitle>
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <Icon icon="solar:clock-circle-linear" className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatCustomerMoney(summary.pending_refund_amount, summary.currency)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Refunds awaiting final settlement
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Orders & Activity Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order History Summary */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Order History &amp; Activity</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Purchasing frequency and order timeline
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Orders Placed</p>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
                  {summary.order_count.toLocaleString()}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary-normal/15 text-primary-active">
                <Icon icon="solar:bag-3-linear" className="size-5" />
              </div>
            </div>

            <div className="divide-y rounded-lg border text-xs">
              <div className="flex items-center justify-between p-3">
                <span className="text-muted-foreground font-medium">First Order Placed</span>
                <span className="font-semibold text-foreground">
                  {summary.first_order_at
                    ? formatCustomerDate(summary.first_order_at, true)
                    : "No orders yet"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-muted-foreground font-medium">Most Recent Order</span>
                <span className="font-semibold text-foreground">
                  {summary.last_order_at
                    ? formatCustomerDate(summary.last_order_at, true)
                    : "No orders yet"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-muted-foreground font-medium">Currency</span>
                <span className="font-semibold text-foreground uppercase">
                  {summary.currency || "USD"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Counts By Status */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Orders by Status</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Distribution of orders across processing stages
            </p>
          </CardHeader>
          <CardContent>
            {statusEntries.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 py-10 text-center text-muted-foreground">
                <Icon icon="solar:bag-4-linear" className="size-8 text-muted-foreground/60" />
                <p className="text-xs">No status data available yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {statusEntries.map(([statusKey, count]) => {
                  const label =
                    orderStatusLabel[statusKey as keyof typeof orderStatusLabel] ||
                    statusKey.replace(/_/g, " ");
                  const toneClass =
                    statusTone[statusKey as keyof typeof statusTone] ||
                    "border-muted bg-muted/40 text-foreground";
                  const percentage =
                    summary.order_count > 0
                      ? Math.round((Number(count) / summary.order_count) * 100)
                      : 0;

                  return (
                    <div
                      key={statusKey}
                      className="flex items-center justify-between rounded-lg border p-2.5 transition-colors hover:bg-muted/30"
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
                      <span className="font-bold text-xs text-foreground">
                        {Number(count).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
