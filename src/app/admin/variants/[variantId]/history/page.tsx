"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { AdjustInventoryDialog } from "@/components/Admin/AdjustInventoryDialog/AdjustInventoryDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetInventoryAdjustmentsQuery } from "@/redux/features/inventory/inventoryApiSlice";
import { useGetProductVariantDetailQuery } from "@/redux/features/product/productVariantApiSlice";
import { inventoryHistoryColumns } from "@/components/Admin/InventoryHistoryTable/columns";

const DEFAULT_LIMIT = 10;

const VariantHistoryPage = () => {
  const params = useParams<{ variantId: string }>();
  const variantId = params.variantId;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const {
    data: variantData,
    isLoading: isVariantLoading,
    isError: isVariantError,
  } = useGetProductVariantDetailQuery(variantId);

  const { data, isLoading, isFetching, isError } = useGetInventoryAdjustmentsQuery({
    product_variant_id: variantId,
    page,
    limit,
  });

  const variant = variantData?.data;
  const adjustments = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  if (isVariantLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isVariantError || !variant) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
          <p className="text-xs text-muted-foreground">Failed to load this variant.</p>
          <Button variant="secondary" size="sm" render={<Link href="/admin/variants" />}>
            Back to Variants
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title={`${variant.volume_ml} mL — Inventory History`}
        description={`Current quantity: ${variant.quantity}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" render={<Link href={`/admin/variants/${variantId}`} />}>
              Back to Variant
            </Button>
            <AdjustInventoryDialog
              productId={variant.product_id}
              variantId={variantId}
              variantLabel={`${variant.volume_ml} mL`}
              currentQuantity={variant.quantity}
              trigger="button"
            />
          </div>
        }
      />

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:danger-circle-linear" className="h-6 w-6 text-destructive" />
            <p className="text-xs text-muted-foreground">Failed to load inventory history.</p>
          </CardContent>
        </Card>
      ) : !isLoading && adjustments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon icon="solar:history-linear" className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No inventory adjustments yet for this variant.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={inventoryHistoryColumns}
          data={adjustments}
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
};

export default VariantHistoryPage;
