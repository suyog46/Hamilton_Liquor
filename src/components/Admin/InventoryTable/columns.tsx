"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdjustInventoryDialog } from "@/components/Admin/AdjustInventoryDialog/AdjustInventoryDialog";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/redux/features/product/productApiSlice";

function VariantsCell({ product }: { product: Product }) {
  if (product.variants.length === 0) {
    return <span className="text-muted-foreground">No variants</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      {product.variants.map((variant) => (
        <div key={variant.id} className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[11px] font-medium">{variant.volume_ml} mL</span>
          <Badge
            variant={variant.quantity > 0 ? "secondary" : "outline"}
            className="w-16 justify-center"
          >
            Qty {variant.quantity}
          </Badge>
          <AdjustInventoryDialog
            productId={product.id}
            variantId={variant.id}
            variantLabel={`${variant.volume_ml} mL`}
            currentQuantity={variant.quantity}
            trigger="icon"
          />
          <Link
            href={`/admin/products/${product.id}/variants/${variant.id}/history`}
            aria-label="See variant history"
            className="cursor-pointer text-muted-foreground transition-colors hover:text-primary-normal"
          >
            <Icon icon="solar:clock-circle-linear" className="h-4 w-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}

export const inventoryColumns: ColumnDef<Product>[] = [
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
    id: "variants",
    header: "Variants & Stock",
    cell: ({ row }) => <VariantsCell product={row.original} />,
  },
];
