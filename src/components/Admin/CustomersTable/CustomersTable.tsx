"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetCustomersQuery,
  type CustomerSortBy,
} from "@/redux/features/customer/customerApiSlice";
import { customerColumns } from "./columns";

const DEFAULT_LIMIT = 10;

type SortOrder = "asc" | "desc";

const SORT_BY_OPTIONS: { value: CustomerSortBy; label: string }[] = [
  { value: "created_at", label: "Date joined" },
  { value: "name", label: "Customer name" },
  { value: "net_spent", label: "Total spent" },
  { value: "order_count", label: "Order count" },
  { value: "last_order_at", label: "Last order date" },
];

const SORT_ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Newest / Highest first" },
  { value: "asc", label: "Oldest / Lowest first" },
];

interface CustomersTableProps {
  search?: string;
}

export function CustomersTable({ search }: CustomersTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState<CustomerSortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetCustomersQuery({
    page,
    limit,
    search: search ? search.trim() : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const customers = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const isTableLoading = isLoading || (isFetching && customers.length === 0);

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="size-7 text-destructive"
          />
          <p className="text-xs text-muted-foreground">
            Failed to load customers from the store.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
            className="text-xs"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Controls & Counts */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          {pagination ? (
            <>
              Showing <strong className="text-foreground">{customers.length}</strong> of{" "}
              <strong className="text-foreground">{pagination.total_items}</strong> customer
              {pagination.total_items === 1 ? "" : "s"}
            </>
          ) : (
            " "
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort By Field */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val as CustomerSortBy);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_BY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order Direction */}
          <Select
            value={sortOrder}
            onValueChange={(val) => {
              setSortOrder(val as SortOrder);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              {SORT_ORDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <DataTable
          columns={customerColumns}
          data={customers}
          isLoading={isTableLoading}
          skeletonRows={limit}
          emptyMessage={
            search ? (
              <div className="flex flex-col items-center gap-1 py-8">
                <Icon icon="solar:magnifer-linear" className="size-6 text-muted-foreground" />
                <p className="font-medium text-foreground">No matching customers</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-8">
                <Icon icon="solar:users-group-rounded-linear" className="size-6 text-muted-foreground" />
                <p className="font-medium text-foreground">No customers found</p>
                <p className="text-xs text-muted-foreground">
                  Registered customers will appear here.
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
