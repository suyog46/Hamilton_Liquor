"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { OrdersTable } from "@/components/Admin/OrdersTable/OrdersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { orderStatusLabel } from "@/components/Order/orderDisplay";
import type { OrderStatus } from "@/redux/features/order/orderApiSlice";

const STATUS_OPTIONS: { value: "ALL" | OrderStatus; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUSED", label: "Refused" },
];

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get("status") as OrderStatus | null;
  const urlCustomerId = searchParams.get("customer_id") || "";

  const [status, setStatus] = useState<"ALL" | OrderStatus>(
    urlStatus && ["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED", "REFUSED"].includes(urlStatus)
      ? urlStatus
      : "ALL"
  );
  const [customerIdInput, setCustomerIdInput] = useState(urlCustomerId);
  const [activeCustomerId, setActiveCustomerId] = useState(urlCustomerId);

  // Sync state if URL searchParams change externally (e.g. browser back/forward)
  useEffect(() => {
    const qStatus = searchParams.get("status") as OrderStatus | null;
    const qCustomer = searchParams.get("customer_id") || "";

    setStatus(
      qStatus && ["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED", "REFUSED"].includes(qStatus)
        ? qStatus
        : "ALL"
    );
    setCustomerIdInput(qCustomer);
    setActiveCustomerId(qCustomer);
  }, [searchParams]);

  const updateUrlParams = (
    nextStatus: "ALL" | OrderStatus,
    nextCustomerId: string
  ) => {
    const params = new URLSearchParams();
    if (nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextCustomerId.trim()) params.set("customer_id", nextCustomerId.trim());

    const queryString = params.toString();
    const targetUrl = queryString ? `/admin/orders?${queryString}` : "/admin/orders";
    router.replace(targetUrl, { scroll: false });
  };

  const handleStatusChange = (val: "ALL" | OrderStatus | null) => {
    const nextStatus = val ?? "ALL";
    setStatus(nextStatus);
    updateUrlParams(nextStatus, activeCustomerId);
  };

  const handleApplyCustomerId = (e?: React.FormEvent) => {
    e?.preventDefault();
    const nextCustomer = customerIdInput.trim();
    setActiveCustomerId(nextCustomer);
    updateUrlParams(status, nextCustomer);
  };

  const handleClearCustomerId = () => {
    setCustomerIdInput("");
    setActiveCustomerId("");
    updateUrlParams(status, "");
  };

  const handleResetAllFilters = () => {
    setStatus("ALL");
    setCustomerIdInput("");
    setActiveCustomerId("");
    updateUrlParams("ALL", "");
  };

  const hasActiveFilters = status !== "ALL" || Boolean(activeCustomerId.trim());

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Orders"
        description="Review, filter, and fulfill pickup and delivery orders."
      />

      {/* Filter Controls Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-2xs">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
                Status:
              </span>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer ID Filter Form */}
            <form onSubmit={handleApplyCustomerId} className="flex items-center gap-1.5">
              <div className="relative w-full sm:w-64">
                <Icon
                  icon="solar:user-id-linear"
                  className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Filter by Customer ID…"
                  value={customerIdInput}
                  onChange={(e) => setCustomerIdInput(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs font-mono"
                />
                {customerIdInput && (
                  <button
                    type="button"
                    onClick={handleClearCustomerId}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Clear customer filter"
                  >
                    <Icon icon="solar:close-circle-linear" className="size-3.5" />
                  </button>
                )}
              </div>
              <Button type="submit" size="sm" variant="secondary" className="h-8 px-2.5 text-xs">
                Apply
              </Button>
            </form>
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="text-[11px] font-medium text-primary-active hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Pills Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-t pt-2 text-[11px]">
            <span className="text-muted-foreground">Active filters:</span>
            {status !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 font-medium text-foreground">
                Status: {orderStatusLabel[status]}
                <button
                  type="button"
                  onClick={() => handleStatusChange("ALL")}
                  className="text-red-300 hover:text-red-400"
                  aria-label="Remove status filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-4" />
                </button>
              </span>
            )}
            {activeCustomerId.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary-normal/30 bg-primary-normal/10 px-2 py-0.5 font-medium text-foreground font-mono">
                Customer: {activeCustomerId.slice(0, 12)}...
                <button
                  type="button"
                  onClick={handleClearCustomerId}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove customer filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <OrdersTable
        status={status}
        customerId={activeCustomerId}
        onResetFilters={handleResetAllFilters}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
