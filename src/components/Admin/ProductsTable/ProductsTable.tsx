"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

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
  useGetProductsQuery,
  type GetProductsParams,
} from "@/redux/features/product/productApiSlice";
import { productColumns } from "./columns";

const DEFAULT_LIMIT = 10;

type SortBy = NonNullable<GetProductsParams["sort_by"]>;
type SortOrder = NonNullable<GetProductsParams["sort_order"]>;

const SORT_BY_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "created_at", label: "Date created" },
  { value: "updated_at", label: "Last updated" },
];

const SORT_ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

interface ProductsTableProps {
  search?: string;
}

// The "reusable parent": owns the query params (page, sort, search) and
// talks to the API. Renders the resource-agnostic core DataTable/pagination
// with product-specific columns. A CategoriesTable/BrandsTable would follow
// the same shape, reusing the same core pieces from components/ui.
export function ProductsTable({ search }: ProductsTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const { data, isLoading, isFetching, isError } = useGetProductsQuery({
    page,
    limit,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  console.log("data in products table", data);
  const products = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">Failed to load products.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          {pagination ? `${pagination.total_items} products` : " "}
        </p>

        <div className="flex items-center gap-2">
          <Select
            items={SORT_BY_OPTIONS}
            value={sortBy}
            onValueChange={(value) => value && setSortBy(value)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_BY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={SORT_ORDER_OPTIONS}
            value={sortOrder}
            onValueChange={(value) => value && setSortOrder(value)}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_ORDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isLoading && products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:box-linear" className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {search ? "No products match your search." : "No products yet. Add your first one."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={productColumns}
          data={products}
          isLoading={isLoading}
          skeletonRows={limit}
        />
      )}

      {pagination && (
        <DataTablePagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          disabled={isFetching}
        />
      )}
    </div>
  );
}
