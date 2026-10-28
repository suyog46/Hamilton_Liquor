"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import type { PublicSaleItem } from "@/redux/features/sale/saleApiSlice";
import { getPrimaryVariantMedia } from "@/redux/features/product/productApiSlice";
import { formatAbv, formatPrice, formatVolume } from "@/lib/utils/productDisplay";
import {
  cartApiSlice,
  useAddToCartMutation,
  type CartProductVariant,
} from "@/redux/features/cart/cartApiSlice";
import { useGetMaximumQuantity } from "@/hooks/use-get-maximum-quantity";
import { useCartStore, type CartStore } from "@/lib/stores/cartStore";
import { getCartItemCount } from "@/lib/utils/cartDisplay";
import { useAppDispatch } from "@/redux/hooks";
import { apiSlice } from "@/redux/apiSlice";
import { cn } from "@/lib/utils";

const parseTargetDate = (input?: string | number): number => {
  if (!input) return NaN;
  if (typeof input === "number") return input;
  const str = String(input).trim();
  if (!str) return NaN;
  let target = new Date(str).getTime();
  if (!isNaN(target)) return target;

  const isoFormatted = str.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, "$1T$2");
  target = new Date(isoFormatted).getTime();
  if (!isNaN(target)) return target;

  return NaN;
};

const useCountdown = (targetDateInput?: string | number) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!targetDateInput) {
      setTimeLeft(null);
      return;
    }

    const calculate = () => {
      const target = parseTargetDate(targetDateInput);
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDateInput]);

  return timeLeft;
};

export interface SaleCardProps {
  item: PublicSaleItem;
  isDialog?: boolean;
  onItemClick?: () => void;
}

export const SaleCard = ({
  item,
  isDialog = false,
  onItemClick,
}: SaleCardProps) => {
  const dispatch = useAppDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const setCartCount = useCartStore((state: CartStore) => state.setCount);
  const cartCount = useCartStore((state: CartStore) => state.count);
  const addGuestItem = useCartStore((state: CartStore) => state.addGuestItem);
  const openCartSheet = useCartStore((state: CartStore) => state.openCartSheet);

  const { product, variant } = item;
  const originalPrice = Number(variant.price);
  const salePrice = Number(variant.sale_price);
  const percentage = Math.round(Math.abs(Number(variant.sale_percentage)));
  const inStock = variant.available_quantity > 0;

  const { isLoggedIn, isAtCartLimit } = useGetMaximumQuantity({
    variantId: variant.id,
    availableQuantity: variant.available_quantity,
  });

  const rawItem = item as any;
  const rawVariant = variant as any;
  const rawProduct = product as any;

  const primaryMedia =
    getPrimaryVariantMedia(variant.media ?? []) ??
    getPrimaryVariantMedia(rawItem.media ?? []) ??
    variant.thumbnail ??
    product.thumbnail;

  const saleEndDate =
    rawItem.ended_at ||
    rawItem.sale_end_at ||
    rawItem.end_at ||
    rawItem.sale_ended_at ||
    rawItem.sale?.ended_at ||
    rawItem.sale?.end_at ||
    rawItem.sale?.sale_end_at ||
    rawVariant.ended_at ||
    rawVariant.sale_end_at ||
    rawVariant.end_at ||
    rawVariant.sale_ended_at ||
    rawVariant.sale?.ended_at ||
    rawProduct.ended_at;

  const timeLeft = useCountdown(saleEndDate);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isAdding || isAtCartLimit) return;

    const cartVariant: CartProductVariant = {
      id: variant.id,
      sku: variant.sku,
      display_name: variant.display_name,
      product: { id: product.id, name: product.name, slug: product.slug },
      volume_ml: variant.volume_ml,
      price: variant.price,
      sale_price: variant.sale_price,
      sale_percentage: variant.sale_percentage,
      sale_started_at: variant.sale_started_at,
      sale_ended_at: variant.sale_ended_at,
      has_sale: true,
      alcohol_percentage: variant.alcohol_percentage ?? "",
      available_quantity: variant.available_quantity,
      is_active: true,
      thumbnail: primaryMedia ?? { id: `product:${product.id}`, url: "" },
    };

    if (!isLoggedIn) {
      addGuestItem(cartVariant, 1);
      toast.success("Added to cart.");
      openCartSheet();
      return;
    }

    const previousCount = cartCount;
    const now = new Date().toISOString();
    const optimisticPatch = dispatch(
      cartApiSlice.util.updateQueryData("getCart", undefined, (draft) => {
        const existing = draft.data.items.find(
          (i) => i.product_variant.id === variant.id,
        );
        if (existing) {
          existing.quantity += 1;
        } else {
          draft.data.items.push({
            id: `optimistic:${variant.id}`,
            quantity: 1,
            product_variant: cartVariant,
            created_at: now,
            updated_at: now,
          });
        }
      }),
    );
    setCartCount(previousCount + 1);
    openCartSheet();

    try {
      const res = await addToCart({
        items: [
          {
            product_variant_id: variant.id,
            quantity: 1,
          },
        ],
      }).unwrap();
      setCartCount(getCartItemCount(res.data));
      dispatch(
        apiSlice.util.invalidateTags([
          { type: "Product", id: product.id },
          { type: "Product", id: product.slug },
          { type: "Product", id: "PUBLIC_LIST" },
          { type: "Sale", id: "PUBLIC_LIST" },
        ]),
      );
      toast.success("Added to cart.");
    } catch {
      optimisticPatch.undo();
      setCartCount(previousCount);
      toast.error("Failed to add to cart.");
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between bg-neutral-900/90 border border-[#E3B97D]/30 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#E3B97D]/60 hover:shadow-2xl h-full cursor-pointer w-full",
        isDialog
          ? "rounded-2xl sm:rounded-3xl p-4 sm:p-5 min-h-[460px] sm:min-h-[500px]"
          : "rounded-3xl p-6 min-h-[480px] sm:min-h-[520px]"
      )}
    >
      <Link href={`/shop/${product.slug}`} onClick={onItemClick} className="contents">
        <div>
          {/* Sale Badge & Volume */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-normal px-2.5 py-0.5 text-xs font-bold text-black shadow-sm">
              <Icon icon="solar:fire-bold" className="h-3.5 w-3.5 text-black" />
              {percentage > 0 ? `${percentage}% OFF` : "ON SALE"}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {variant.is_liquor
                ? formatVolume(variant.volume_ml)
                : variant.display_name}
            </span>
          </div>

          {/* Media Thumbnail */}
          <div
            className={cn(
              "relative mb-4 w-full overflow-hidden bg-neutral-800/80 rounded-2xl",
              isDialog ? "h-60 sm:h-72" : "h-60 sm:h-72"
            )}
          >
            {primaryMedia?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryMedia.url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-600">
                <Icon icon="solar:bottle-linear" className="h-12 w-12" />
              </div>
            )}

            {/* Countdown overlay on image */}
            {timeLeft && !timeLeft.isExpired && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-1 rounded-xl bg-black/85 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-primary-normal border border-primary-normal/40 shadow-xl z-10">
                <Icon icon="solar:clock-circle-bold" className="h-3.5 w-3.5 text-primary-normal animate-pulse shrink-0" />
                <span>
                  {timeLeft.days > 0
                    ? `Ends in ${timeLeft.days}d ${timeLeft.hours}h`
                    : `Ends in ${String(timeLeft.hours).padStart(2, "0")}:${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`}
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="group-hover:text-primary-normal transition-colors flex-1 flex flex-col justify-between min-h-[80px]">
            <h3
              className={cn(
                "font-title font-bold text-white leading-snug line-clamp-2 min-h-[2.5rem]",
                isDialog ? "text-sm sm:text-base" : "text-base sm:text-lg"
              )}
            >
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-gray-400 font-medium line-clamp-2 min-h-[1.25rem]">
              {variant.is_liquor
                ? `${formatVolume(variant.volume_ml)}${variant.alcohol_percentage ? ` · ${formatAbv(variant.alcohol_percentage)}` : ""}`
                : variant.display_name}
            </p>
          </div>
        </div>
      </Link>

      {/* Pricing & Add to Cart Action */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          {/* Strikethrough Original Price */}
          <span className="text-xs font-medium text-gray-400 line-through">
            {formatPrice(originalPrice)}
          </span>
          {/* Sale Price */}
          <span className="text-lg sm:text-xl font-bold text-primary-normal">
            {formatPrice(salePrice)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || isAdding || isAtCartLimit}
          className={cn(
            "flex items-center justify-center h-10 w-10 rounded-full transition-all shadow-md",
            !inStock || isAdding || isAtCartLimit
              ? "bg-white/10 text-gray-500 cursor-not-allowed"
              : "bg-primary-normal text-black hover:bg-primary-hover hover:scale-105 active:scale-95",
          )}
        >
          <Icon
            icon={
              isAdding
                ? "svg-spinners:180-ring"
                : isAtCartLimit
                  ? "solar:check-circle-bold"
                  : "solar:cart-plus-bold"
            }
            className="h-5 w-5"
          />
        </button>
      </div>
    </div>
  );
};

export default SaleCard;
