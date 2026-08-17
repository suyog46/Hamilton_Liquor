import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { AdjustInventoryDialog } from "@/components/Admin/AdjustInventoryDialog/AdjustInventoryDialog";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {variants.map((variant) => {
        console.log("variant", variant);
        const image = (
          <div className="relative  w-full overflow-hidden rounded-lg bg-gray-100">
            {variant.media[0]?.media?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <div className="h-[120px] w-full relative ">
              <Image 
              src={variant.media[0]?.media?.url }
              alt="image here " 
              fill
              className=" object-cover" />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Icon icon="solar:gallery-linear" className="h-8 w-8" />
              </div>
            )}
            <span
              aria-label={variant.is_active ? "Active" : "Inactive"}
              className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-lg text-white ${
                variant.is_active ? "bg-success" : "bg-destructive"
              }`}
            >
                {variant.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        );

        const info = (
          <div className="min-w-0">
            <p className="font-medium">{variant.volume_ml} mL</p>
            <p className="text-[11px] text-muted-foreground">
              ${Number(variant.price).toFixed(2)} · Qty {variant.quantity}
            </p>
          </div>
        );

        if (compact) {
          return (
            <Link
              key={variant.id}
              href={`/admin/variants/${variant.id}`}
              className="flex flex-col gap-3 rounded-xl border border-input p-3 transition-colors hover:border-primary-normal"
            >
              {image}
              {info}
            </Link>
          );
        }

        return (
          <div key={variant.id} className="flex flex-col gap-3 rounded-xl border border-input p-3">
            <Link href={`/admin/variants/${variant.id}`}>{image}</Link>
            {info}
            <div className="flex items-center gap-2 border-t border-input pt-2.5">
              <AdjustInventoryDialog
                productId={productId}
                variantId={variant.id}
                variantLabel={`${variant.volume_ml} mL`}
                currentQuantity={variant.quantity}
                trigger="button"
                className="h-7 px-2 text-[11px]"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 gap-1.5 rounded-md px-2 text-[11px]"
                render={<Link href={`/admin/variants/${variant.id}/history`} />}
              >
                <Icon icon="solar:clock-circle-linear" className="h-3.5 w-3.5" />
                History
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantCardGrid;
