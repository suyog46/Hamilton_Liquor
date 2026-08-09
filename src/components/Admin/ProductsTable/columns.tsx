"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  useDeleteProductMutation,
  type Product,
} from "@/redux/features/product/productApiSlice";
import { cn } from "@/lib/utils/cn";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
};

const formatPriceRange = (product: Product) => {
  if (product.variants.length === 0) return "—";
  const prices = product.variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
};

const totalStock = (product: Product) =>
  product.variants.reduce((sum, v) => sum + v.quantity, 0);

function ActionsCell({ product }: { product: Product }) {
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setConfirming(true);
    try {
      await deleteProduct(product.id).unwrap();
      toast.success("Product deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete product."));
    } finally {
      setConfirming(false);
    }
  };

  const isDeleting = isLoading && confirming;

  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        href={`/admin/products/${product.id}`}
        aria-label="Edit product"
        className="text-muted-foreground transition-colors hover:text-primary-normal"
      >
        <Icon icon="solar:pen-linear" className="h-4 w-4" />
      </Link>
      <button
        type="button"
        aria-label="Delete product"
        disabled={isDeleting}
        onClick={handleDelete}
        className="text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting ? (
          <Icon icon="svg-spinners:180-ring" className="h-4 w-4 text-destructive" />
        ) : (
          <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Link href={`/admin/products/${product.id}`} className="block min-w-0">
          <p className="truncate font-medium hover:text-primary-normal">{product.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">/{product.slug}</p>
        </Link>
      );
    },
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => row.original.category.name,
  },
  {
    id: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand.name,
  },
  {
    id: "country",
    header: "Country",
    cell: ({ row }) => row.original.country?.name ?? "—",
  },
  {
    id: "price",
    header: "Price",
    cell: ({ row }) => formatPriceRange(row.original),
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => totalStock(row.original),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={cn(row.original.is_active ? "bg-green-700 text-white" : "outline")}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
];
