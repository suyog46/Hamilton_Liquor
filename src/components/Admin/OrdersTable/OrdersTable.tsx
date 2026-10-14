"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  type FulfillmentStatus,
  type OrderStatus,
  useGetAdminOrdersQuery,
} from "@/redux/features/order/orderApiSlice";
import { orderColumns } from "./columns";

const DEFAULT_LIMIT = 10;

interface OrdersTableProps {
  status?: "ALL" | OrderStatus;
  fulfillmentStatus?: "ALL" | FulfillmentStatus;
  customerId?: string;
  search?: string;
  sortBy?: "created_at" | "total" | string;
  sortOrder?: "asc" | "desc";
  createdFrom?: string;
  createdTo?: string;
  onResetFilters?: () => void;
}

export function OrdersTable({
  status = "ALL",
  fulfillmentStatus = "ALL",
  customerId = "",
  search = "",
  sortBy = "created_at",
  sortOrder = "desc",
  createdFrom = "",
  createdTo = "",
  onResetFilters,
}: OrdersTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Reset to first page whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [status, fulfillmentStatus, customerId, search, sortBy, sortOrder, createdFrom, createdTo]);

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const cleanCustomerId = customerId.trim();
  const cleanSearch = search.trim();
  const cleanCreatedFrom = createdFrom.trim();
  const cleanCreatedTo = createdTo.trim();

  const queryStatus = status === "ALL" ? undefined : status;
  const queryFulfillmentStatus = fulfillmentStatus === "ALL" ? undefined : fulfillmentStatus;

  const hasActiveFilters =
    status !== "ALL" ||
    fulfillmentStatus !== "ALL" ||
    Boolean(cleanCustomerId) ||
    Boolean(cleanSearch) ||
    Boolean(cleanCreatedFrom) ||
    Boolean(cleanCreatedTo) ||
    sortBy !== "created_at" ||
    sortOrder !== "desc";

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminOrdersQuery({
    page,
    limit,
    status: queryStatus,
    fulfillment_status: queryFulfillmentStatus,
    customer_id: cleanCustomerId || undefined,
    search: cleanSearch || undefined,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
    created_from: cleanCreatedFrom || undefined,
    created_to: cleanCreatedTo || undefined,
  });

  const orders = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const isTableLoading = isLoading || (isFetching && orders.length === 0);

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="size-7 text-destructive"
          />
          <p className="text-xs text-muted-foreground">
            Failed to load orders from the store.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
            className="text-xs mt-1"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Table Container with Custom DataTable */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <DataTable
          columns={orderColumns}
          data={orders}
          isLoading={isTableLoading}
          skeletonRows={limit}
          emptyMessage={
            hasActiveFilters ? (
              <div className="flex flex-col items-center gap-1.5 py-12 text-center">
                <Icon
                  icon="solar:bag-4-linear"
                  className="size-8 text-muted-foreground/60"
                />
                <p className="font-semibold text-sm text-foreground">No matching orders</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {cleanCustomerId
                    ? `No orders found for customer ID: ${cleanCustomerId}`
                    : cleanSearch
                      ? `No orders found matching "${cleanSearch}".`
                      : "No orders match the current filter criteria."}
                </p>
                {onResetFilters && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onResetFilters}
                    className="mt-2 text-xs"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-12 text-center">
                <Icon
                  icon="solar:bag-4-linear"
                  className="size-8 text-muted-foreground/60"
                />
                <p className="font-semibold text-sm text-foreground">No orders placed</p>
                <p className="text-xs text-muted-foreground">
                  Orders will appear here once customers checkout.
                </p>
              </div>
            )
          }
        />
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.total_pages > 0 && (
        <DataTablePagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          onPageChange={setPage}
          limit={pagination.limit}
          onLimitChange={handleLimitChange}
          disabled={isFetching}
        />
      )}
    </div>
  );
}
