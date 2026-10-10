"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import {
  useGetPublicSalesQuery,
  type PublicSaleItem,
} from "@/redux/features/sale/saleApiSlice";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

const SaleCard = ({
  item,
  isDialog = false,
  onItemClick,
}: {
  item: PublicSaleItem;
  isDialog?: boolean;
  onItemClick?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const setCartCount = useCartStore((state: CartStore) => state.setCount);
  const cartCount = useCartStore((state: CartStore) => state.count);
  const addGuestItem = useCartStore((state: CartStore) => state.addGuestItem);
  const guestItems = useCartStore((state: CartStore) => state.guestItems);
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

export interface SaleSectionProps {
  hideIfEmpty?: boolean;
  isDialog?: boolean;
  onItemClick?: () => void;
}

const SaleSection = ({
  hideIfEmpty = false,
  isDialog = false,
  onItemClick,
}: SaleSectionProps) => {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError } = useGetPublicSalesQuery({
    page,
    limit,
  });

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  if (!isLoading && (isError || items.length === 0)) {
    if (hideIfEmpty) {
      return null;
    }
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#181512] via-[#241E17] to-[#181512] border-y border-[#E3B97D]/20 py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <Icon icon="solar:tag-price-bold-duotone" className="mx-auto h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-xl font-bold text-white">No Items Currently on Sale</h3>
          <p className="mt-1 text-sm text-gray-400">Check back soon for new discounts and weekly deals!</p>
        </div>
      </section>
    );
  }

  const content = (
    <Carousel
      key={page}
      opts={{ align: isDialog ? "center" : "start", loop: isDialog ? items.length > 2 : false }}
      className="w-full"
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
          isDialog ? "mb-5 pr-8" : "mb-8"
        )}
      >
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-normal/15 px-3 py-1 text-xs font-semibold text-primary-normal border border-primary-normal/30 mb-2">
            <Icon icon="solar:tag-bold-duotone" className="h-4 w-4" />
            {isDialog ? "Special Welcome Deals" : "Limited Time Deals"}
          </span>
          <h2
            className={cn(
              "font-title font-extrabold tracking-tight text-white",
              isDialog ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
            )}
          >
            Weekly Specials & Sales
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            Grab your favorite spirits, wines, and beers at special discounted prices.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/specials"
            onClick={onItemClick}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-normal hover:text-primary-hover transition-colors mr-2"
          >
            <span>View All</span>
            <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-9 w-9 sm:h-10 sm:w-10 border-[#E3B97D]/30 text-primary-normal hover:bg-primary-normal hover:text-black hover:border-primary-normal" />
            <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-9 w-9 sm:h-10 sm:w-10 border-[#E3B97D]/30 text-primary-normal hover:bg-primary-normal hover:text-black hover:border-primary-normal" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          className={cn(
            "grid gap-6",
            isDialog
              ? "grid-cols-1 sm:grid-cols-2 "
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {Array.from({ length: isDialog ? 2 : 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "rounded-3xl bg-white/5 w-full",
                isDialog ? "h-[500px] max-w-[460px]" : "h-[520px]"
              )}
            />
          ))}
        </div>
      ) : (
        <CarouselContent
          className={cn(
            isDialog
              ? "-ml-3 sm:-ml-4"
              : "-ml-4 sm:-ml-6"
          )}
        >
          {items.map((item) => (
            <CarouselItem
              key={`${item.product.id}-${item.variant.id}`}
              className={cn(
                isDialog
                  ? "pl-3 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/2 xl:basis-1/2"
                  : "pl-4 sm:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              )}
            >
              <SaleCard item={item} isDialog={isDialog} onItemClick={onItemClick} />
            </CarouselItem>
          ))}
        </CarouselContent>
      )}

      {!isDialog && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 hover:border-primary-normal hover:text-primary-normal disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
            Previous Page
          </button>
          <span className="text-xs text-gray-400 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 hover:border-primary-normal hover:text-primary-normal disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Next Page
            <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
          </button>
        </div>
      )}
    </Carousel>
  );

  if (isDialog) {
    return <div className="relative w-full">{content}</div>;
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#181512] via-[#241E17] to-[#181512] border-y border-[#E3B97D]/20 py-16 text-white">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-normal/10 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {content}
      </div>
    </section>
  );
};

export default SaleSection;


