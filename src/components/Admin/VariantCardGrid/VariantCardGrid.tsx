import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { AdjustInventoryDialog } from "@/components/Admin/AdjustInventoryDialog/AdjustInventoryDialog";
import AddSaleDialog from "@/components/Admin/AddSaleDialog/AddSaleDialog";
import type { ProductVariant } from "@/redux/features/product/productApiSlice";
import Image from "next/image";

interface VariantCardGridProps {
  productId: string;
  variants: ProductVariant[];
  emptyMessage?: string;
  // Product detail page: just the essentials (image, volume, price, qty) and
  // a link to the variant's own page — everything else (edit, delete,
  // adjust stock, history) lives there now, not duplicated here.
  compact?: boolean;
}

const VariantCardGrid = ({
  productId,
  variants,
  emptyMessage = "No variants yet. Add one to start selling this product.",
  compact = false,
}: VariantCardGridProps) => {
  if (variants.length === 0) {
    return <p className="py-4 text-center text-xs text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {variants.map((variant) => {
        const variantLabel = variant.display_name || `${variant.volume_ml} mL`;
        const image = (
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
            {variant.media[0]?.media?.url ? (
              <Image 
                src={variant.media[0]?.media?.url}
                alt={variantLabel} 
                fill
                className="object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Icon icon="solar:gallery-linear" className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            )}
            <span
              aria-label={variant.is_active ? "Active" : "Inactive"}
              className={`absolute top-1 right-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium rounded text-white ${
                variant.is_active ? "bg-success" : "bg-destructive"
              }`}
            >
              {variant.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        );

        const info = (
          <div className="flex-1 min-w-0">
            <Link href={`/admin/variants/${variant.id}`} className="hover:underline">
              <p className="font-semibold text-sm text-foreground truncate">{variantLabel}</p>
            </Link>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              SKU: {variant.sku}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">${Number(variant.price).toFixed(2)}</span>
              <span>·</span>
              <span><strong className="text-foreground">{variant.available_quantity}</strong> avail</span>
              <span>·</span>
              <span>{variant.reserved_quantity} rsvd</span>
              <span>·</span>
              <span>{variant.quantity} total</span>
            </div>
          </div>
        );

        if (compact) {
          return (
            <Link
              key={variant.id}
              href={`/admin/variants/${variant.id}`}
              className="flex items-center gap-3 sm:gap-4 rounded-xl border border-input p-3 transition-colors hover:border-primary-normal bg-white"
            >
              {image}
              {info}
            </Link>
          );
        }

        return (
          <div
            key={variant.id}
            className="flex flex-col gap-3 rounded-xl border border-input p-3.5 sm:p-4 bg-white shadow-xs w-full"
          >
            {/* Top row: Image & Info */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <Link href={`/admin/variants/${variant.id}`} className="shrink-0">
                {image}
              </Link>
              {info}
            </div>

            {/* Bottom row: Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-input pt-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <AddSaleDialog variantId={variant.id} variantLabel={variantLabel} />
                <AdjustInventoryDialog
                  productId={productId}
                  variantId={variant.id}
                  variantLabel={variantLabel}
                  currentQuantity={variant.quantity}
                  trigger="button"
                  className="h-8 px-2.5 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md px-2.5 text-xs"
                  render={<Link href={`/admin/sales/${variant.id}`} />}
                >
                  <Icon icon="solar:sale-linear" className="h-3.5 w-3.5" />
                  Sale history
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md px-2.5 text-xs"
                  render={<Link href={`/admin/variants/${variant.id}/history`} />}
                >
                  <Icon icon="solar:clock-circle-linear" className="h-3.5 w-3.5" />
                  History
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantCardGrid;
