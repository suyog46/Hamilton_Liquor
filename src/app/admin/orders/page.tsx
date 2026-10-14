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
import { fulfillmentLabel, orderStatusLabel } from "@/components/Order/orderDisplay";
import type {
  FulfillmentStatus,
  OrderStatus,
} from "@/redux/features/order/orderApiSlice";

const STATUS_OPTIONS: { value: "ALL" | OrderStatus; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUSED", label: "Refused" },
];

const FULFILLMENT_OPTIONS: { value: "ALL" | FulfillmentStatus; label: string }[] = [
  { value: "ALL", label: "All Fulfillment" },
  { value: "PENDING", label: "Pending (Placed)" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REFUSED", label: "Refused" },
];

const SORT_OPTIONS: {
  value: string;
  label: string;
  sortBy: "created_at" | "total";
  sortOrder: "asc" | "desc";
}[] = [
  {
    value: "created_at:desc",
    label: "Placed: Newest first",
    sortBy: "created_at",
    sortOrder: "desc",
  },
  {
    value: "created_at:asc",
    label: "Placed: Oldest first",
    sortBy: "created_at",
    sortOrder: "asc",
  },
  {
    value: "total:desc",
    label: "Total: High to Low",
    sortBy: "total",
    sortOrder: "desc",
  },
  {
    value: "total:asc",
    label: "Total: Low to High",
    sortBy: "total",
    sortOrder: "asc",
  },
];

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "FULFILLED",
  "CANCELLED",
  "REFUSED",
];

const VALID_FULFILLMENTS: FulfillmentStatus[] = [
  "PENDING",
  "PREPARING",
  "READY_FOR_PICKUP",
  "READY_FOR_DELIVERY",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REFUSED",
];

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read raw parameters from search params
  const urlStatus = searchParams.get("status") as OrderStatus | null;
  const urlFulfillment = searchParams.get("fulfillment_status") as FulfillmentStatus | null;
  const urlCustomerId = searchParams.get("customer_id") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlSortBy = searchParams.get("sort_by") || "created_at";
  const urlSortOrder = searchParams.get("sort_order") || "desc";
  const urlCreatedFrom = searchParams.get("created_from") || "";
  const urlCreatedTo = searchParams.get("created_to") || "";

  const initialSortKey = `${urlSortBy}:${urlSortOrder}`;
  const validSortKey = SORT_OPTIONS.some((o) => o.value === initialSortKey)
    ? initialSortKey
    : "created_at:desc";

  // Filter States
  const [status, setStatus] = useState<"ALL" | OrderStatus>(
    urlStatus && VALID_STATUSES.includes(urlStatus) ? urlStatus : "ALL"
  );
  const [fulfillmentStatus, setFulfillmentStatus] = useState<"ALL" | FulfillmentStatus>(
    urlFulfillment && VALID_FULFILLMENTS.includes(urlFulfillment) ? urlFulfillment : "ALL"
  );
  const [sortKey, setSortKey] = useState<string>(validSortKey);

  // Form input states (for text & date filters)
  const [customerIdInput, setCustomerIdInput] = useState(urlCustomerId);
  const [activeCustomerId, setActiveCustomerId] = useState(urlCustomerId);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [activeSearch, setActiveSearch] = useState(urlSearch);

  const [createdFrom, setCreatedFrom] = useState(urlCreatedFrom);
  const [activeCreatedFrom, setActiveCreatedFrom] = useState(urlCreatedFrom);

  const [createdTo, setCreatedTo] = useState(urlCreatedTo);
  const [activeCreatedTo, setActiveCreatedTo] = useState(urlCreatedTo);

  // Sync state if URL searchParams change externally (e.g. browser back/forward)
  useEffect(() => {
    const qStatus = searchParams.get("status") as OrderStatus | null;
    const qFulfillment = searchParams.get("fulfillment_status") as FulfillmentStatus | null;
    const qCustomer = searchParams.get("customer_id") || "";
    const qSearch = searchParams.get("search") || "";
    const qSortBy = searchParams.get("sort_by") || "created_at";
    const qSortOrder = searchParams.get("sort_order") || "desc";
    const qFrom = searchParams.get("created_from") || "";
    const qTo = searchParams.get("created_to") || "";

    setStatus(qStatus && VALID_STATUSES.includes(qStatus) ? qStatus : "ALL");
    setFulfillmentStatus(qFulfillment && VALID_FULFILLMENTS.includes(qFulfillment) ? qFulfillment : "ALL");

    const sk = `${qSortBy}:${qSortOrder}`;
    setSortKey(SORT_OPTIONS.some((o) => o.value === sk) ? sk : "created_at:desc");

    setCustomerIdInput(qCustomer);
    setActiveCustomerId(qCustomer);

    setSearchInput(qSearch);
    setActiveSearch(qSearch);

    setCreatedFrom(qFrom);
    setActiveCreatedFrom(qFrom);

    setCreatedTo(qTo);
    setActiveCreatedTo(qTo);
  }, [searchParams]);

  const updateUrlParams = (overrides: {
    status?: "ALL" | OrderStatus;
    fulfillment_status?: "ALL" | FulfillmentStatus;
    customer_id?: string;
    search?: string;
    sortKey?: string;
    created_from?: string;
    created_to?: string;
  }) => {
    const nextStatus = overrides.status !== undefined ? overrides.status : status;
    const nextFulfillment =
      overrides.fulfillment_status !== undefined
        ? overrides.fulfillment_status
        : fulfillmentStatus;
    const nextCustomerId =
      overrides.customer_id !== undefined ? overrides.customer_id : activeCustomerId;
    const nextSearch = overrides.search !== undefined ? overrides.search : activeSearch;
    const nextSortKey = overrides.sortKey !== undefined ? overrides.sortKey : sortKey;
    const nextCreatedFrom =
      overrides.created_from !== undefined ? overrides.created_from : activeCreatedFrom;
    const nextCreatedTo =
      overrides.created_to !== undefined ? overrides.created_to : activeCreatedTo;

    const [nextSortBy, nextSortOrder] = nextSortKey.split(":") as [
      "created_at" | "total",
      "asc" | "desc",
    ];

    const params = new URLSearchParams();
    if (nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextFulfillment !== "ALL") params.set("fulfillment_status", nextFulfillment);
    if (nextCustomerId.trim()) params.set("customer_id", nextCustomerId.trim());
    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextSortBy && nextSortBy !== "created_at") params.set("sort_by", nextSortBy);
    if (nextSortOrder && nextSortOrder !== "desc") params.set("sort_order", nextSortOrder);
    if (nextCreatedFrom.trim()) params.set("created_from", nextCreatedFrom.trim());
    if (nextCreatedTo.trim()) params.set("created_to", nextCreatedTo.trim());

    const queryString = params.toString();
    const targetUrl = queryString ? `/admin/orders?${queryString}` : "/admin/orders";
    router.replace(targetUrl, { scroll: false });
  };

  const handleStatusChange = (val: "ALL" | OrderStatus | null) => {
    const next = val ?? "ALL";
    setStatus(next);
    updateUrlParams({ status: next });
  };

  const handleFulfillmentChange = (val: "ALL" | FulfillmentStatus | null) => {
    const next = val ?? "ALL";
    setFulfillmentStatus(next);
    updateUrlParams({ fulfillment_status: next });
  };

  const handleSortChange = (val: string | null) => {
    const next = val ?? "created_at:desc";
    setSortKey(next);
    updateUrlParams({ sortKey: next });
  };

  const handleApplyInputs = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanCustomer = customerIdInput.trim();
    const cleanSearch = searchInput.trim();
    const cleanFrom = createdFrom.trim();
    const cleanTo = createdTo.trim();

    setActiveCustomerId(cleanCustomer);
    setActiveSearch(cleanSearch);
    setActiveCreatedFrom(cleanFrom);
    setActiveCreatedTo(cleanTo);

    updateUrlParams({
      customer_id: cleanCustomer,
      search: cleanSearch,
      created_from: cleanFrom,
      created_to: cleanTo,
    });
  };

  const handleClearCustomer = () => {
    setCustomerIdInput("");
    setActiveCustomerId("");
    updateUrlParams({ customer_id: "" });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    updateUrlParams({ search: "" });
  };

  const handleClearDateRange = () => {
    setCreatedFrom("");
    setCreatedTo("");
    setActiveCreatedFrom("");
    setActiveCreatedTo("");
    updateUrlParams({ created_from: "", created_to: "" });
  };

  const handleResetAllFilters = () => {
    setStatus("ALL");
    setFulfillmentStatus("ALL");
    setSortKey("created_at:desc");

    setCustomerIdInput("");
    setActiveCustomerId("");

    setSearchInput("");
    setActiveSearch("");

    setCreatedFrom("");
    setActiveCreatedFrom("");

    setCreatedTo("");
    setActiveCreatedTo("");

    router.replace("/admin/orders", { scroll: false });
  };

  const [sortBy, sortOrder] = sortKey.split(":") as [
    "created_at" | "total",
    "asc" | "desc",
  ];

  const hasActiveFilters =
    status !== "ALL" ||
    fulfillmentStatus !== "ALL" ||
    Boolean(activeCustomerId.trim()) ||
    Boolean(activeSearch.trim()) ||
    Boolean(activeCreatedFrom.trim()) ||
    Boolean(activeCreatedTo.trim()) ||
    sortKey !== "created_at:desc";

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Orders"
        description="Review, filter, and fulfill pickup and delivery orders."
      />

      {/* Filter Controls Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3.5 shadow-2xs">
        {/* Form to submit search and text filters on Enter */}
        <form onSubmit={handleApplyInputs} className="flex flex-col gap-3">
          {/* Row 1: Search, Status, Fulfillment, Sort */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search orders (max 100 chars)…"
                maxLength={100}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="Clear search"
                >
                  <Icon icon="solar:close-circle-linear" className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap hidden xl:inline">
                Status:
              </span>
              <Select
                items={STATUS_OPTIONS}
                value={status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Status">
                    {(val) => STATUS_OPTIONS.find((o) => o.value === val)?.label ?? "All Statuses"}
                  </SelectValue>
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

            {/* Fulfillment Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap hidden xl:inline">
                Progress:
              </span>
              <Select
                items={FULFILLMENT_OPTIONS}
                value={fulfillmentStatus}
                onValueChange={handleFulfillmentChange}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Fulfillment">
                    {(val) => FULFILLMENT_OPTIONS.find((o) => o.value === val)?.label ?? "All Fulfillment"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FULFILLMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap hidden xl:inline">
                Sort:
              </span>
              <Select
                items={SORT_OPTIONS}
                value={sortKey}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Sort by">
                    {(val) => SORT_OPTIONS.find((o) => o.value === val)?.label ?? "Placed: Newest first"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Customer ID, Date Range (created_from / created_to), and Action Buttons */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Customer ID Filter */}
              <div className="relative w-full sm:w-56">
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
                    onClick={handleClearCustomer}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Clear customer filter"
                  >
                    <Icon icon="solar:close-circle-linear" className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Date From */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  From:
                </span>
                <Input
                  type="date"
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                  className="h-8 w-[135px] text-xs"
                />
              </div>

              {/* Date To */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  To:
                </span>
                <Input
                  type="date"
                  value={createdTo}
                  onChange={(e) => setCreatedTo(e.target.value)}
                  className="h-8 w-[135px] text-xs"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                variant="secondary"
                className="h-8 px-3 text-xs gap-1 font-medium cursor-pointer"
              >
                <Icon icon="solar:filter-linear" className="size-3.5" />
                Apply
              </Button>
            </div>

            {/* Reset Filters Action */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="text-[11px] font-medium text-primary-active hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 border-t pt-2 text-[11px]">
            <span className="text-muted-foreground">Active filters:</span>

            {/* Search Badge */}
            {activeSearch.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full border bg-primary-normal/10 px-2.5 py-0.5 font-medium text-foreground">
                Search: &ldquo;{activeSearch}&rdquo;
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Remove search filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-3" />
                </button>
              </span>
            )}

            {/* Status Badge */}
            {status !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2.5 py-0.5 font-medium text-foreground">
                Status: {orderStatusLabel[status]}
                <button
                  type="button"
                  onClick={() => handleStatusChange("ALL")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Remove status filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-3" />
                </button>
              </span>
            )}

            {/* Fulfillment Status Badge */}
            {fulfillmentStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2.5 py-0.5 font-medium text-foreground">
                Progress: {fulfillmentLabel[fulfillmentStatus]}
                <button
                  type="button"
                  onClick={() => handleFulfillmentChange("ALL")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Remove fulfillment status filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-3" />
                </button>
              </span>
            )}

            {/* Customer ID Badge */}
            {activeCustomerId.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary-normal/30 bg-primary-normal/10 px-2.5 py-0.5 font-medium text-foreground font-mono">
                Customer: {activeCustomerId.slice(0, 12)}...
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Remove customer filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-3" />
                </button>
              </span>
            )}

            {/* Date Range Badge */}
            {(activeCreatedFrom.trim() || activeCreatedTo.trim()) && (
              <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2.5 py-0.5 font-medium text-foreground">
                Date: {activeCreatedFrom || "Start"} to {activeCreatedTo || "Now"}
                <button
                  type="button"
                  onClick={handleClearDateRange}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Remove date range filter"
                >
                  <Icon icon="solar:close-circle-bold" className="size-3" />
                </button>
              </span>
            )}

            {/* Sort Badge (if not default) */}
            {sortKey !== "created_at:desc" && (
              <span className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2.5 py-0.5 font-medium text-foreground">
                Sort: {SORT_OPTIONS.find((o) => o.value === sortKey)?.label}
                <button
                  type="button"
                  onClick={() => handleSortChange("created_at:desc")}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Reset sort order"
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
        fulfillmentStatus={fulfillmentStatus}
        customerId={activeCustomerId}
        search={activeSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        createdFrom={activeCreatedFrom}
        createdTo={activeCreatedTo}
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
