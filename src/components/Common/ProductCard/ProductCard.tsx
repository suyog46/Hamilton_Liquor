"use client";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PublicProductListItem } from "@/redux/features/product/productApiSlice";
import { formatPrice, formatVolume } from "@/lib/utils/productDisplay";
import {
  cartApiSlice,
  useAddToCartMutation,
  type CartProductVariant,
} from "@/redux/features/cart/cartApiSlice";
import { useGetMaximumQuantity } from "@/hooks/use-get-maximum-quantity";
import { useCartStore, type CartStore } from "@/lib/stores/cartStore";
import { getCartItemCount } from "@/lib/utils/cartDisplay";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { apiSlice } from "@/redux/apiSlice";

const ProductCard = ({ product }: { product: PublicProductListItem }) => {
  // const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const setCartCount = useCartStore((state: CartStore) => state.setCount);
  const cartCount = useCartStore((state: CartStore) => state.count);
  const addGuestItem = useCartStore((state: CartStore) => state.addGuestItem);
  const openCartSheet = useCartStore((state: CartStore) => state.openCartSheet);

  const singleVariant = product.variants.length === 1 ? product.variants[0] : null;
  const { isLoggedIn, isAtCartLimit } = useGetMaximumQuantity({
    variantId: singleVariant?.id,
    availableQuantity: singleVariant?.available_quantity,
  });

  const inStock = product.is_in_stock;
  const showFromPrice = product.variants.length > 1;
  const isBusy = isAdding;
  const variantLabel = product.variants
    .map((variant) =>
      variant.is_liquor
        ? formatVolume(variant.volume_ml)
        : variant.display_name || null
    )
    .filter(Boolean)
    .join(", ");

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isBusy || isAtCartLimit) return;


    if (product.variants.length > 1) {
      router.push(`/shop/${product.slug}`);
      return;
    }

    const variant = product.variants[0];
    if (!variant || variant.available_quantity <= 0) return;

    const cartVariant: CartProductVariant = {
      id: variant.id,
      sku: variant.sku,
      display_name: variant.display_name,
      product: { id: product.id, name: product.name, slug: product.slug },
      volume_ml: variant.volume_ml,
      price: variant.price ?? product.starting_price,
      sale_price: variant.sale_price,
      sale_percentage: variant.sale_percentage,
      sale_started_at: variant.sale_started_at,
      sale_ended_at: variant.sale_ended_at,
      has_sale: product.has_sale,
      alcohol_percentage: variant.alcohol_percentage ?? "",
      available_quantity: variant.available_quantity,
      is_active: true,
      thumbnail: product.thumbnail ?? { id: `product:${product.id}`, url: "" },
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
        const existing = draft.data.items.find((item) => item.product_variant.id === variant.id);
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
      })
    );
    setCartCount(previousCount + 1);
    openCartSheet();

    try {
      const res = await addToCart({ items: [{ product_variant_id: variant.id, quantity: 1 }] }).unwrap();
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
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)]   ">
      {/* Like button */}
      {/* <button
        aria-label="Add to wishlist"
        onClick={() => setIsLiked((prev) => !prev)}
        className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:scale-105 transition-transform"
      >
        <Icon
          icon={isLiked ? "solar:heart-bold" : "solar:heart-outline"}
          className={cn("w-5 h-5", isLiked ? "text-red-500" : "text-gray-500")}
        />
      </button> */}

      <Link href={`/shop/${product.slug}`} className="contents">
        {/* Product image */}
        <div className="relative h-72 sm:h-80 bg-gray-50 overflow-hidden">
          {product.thumbnail?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail.url}
              alt={product.name}
              className={cn(
                "absolute inset-0 h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out",
                !inStock && "opacity-50 grayscale"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <Icon icon="solar:bottle-linear" className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

          {/* Diagonal Sale Ribbon */}
          {product.has_sale && (
            <div className="absolute top-0 right-0 z-20 h-24 w-24 overflow-hidden pointer-events-none">
              <div className="absolute top-3 -right-8 w-32 rotate-45 bg-gradient-to-r from-[#E3B97D] to-[#C28E47] py-1 text-center text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                ON SALE
              </div>
            </div>
          )}

          <span className="absolute top-4 left-4 text-[11px] font-semibold uppercase tracking-wide text-primary-normal bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {product.category.name}
          </span>
          {!inStock && (
            <span className="absolute inset-x-0 bottom-0 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white bg-black/80">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-5 pt-5 flex flex-col gap-1.5 flex-1 justify-between min-h-[110px]">
          <div>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide truncate block">
              {product.brand.name}
            </span>
            <h3 className="font-title text-base sm:text-lg font-semibold text-black leading-snug line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </div>

          <div className="text-xs text-gray-500 line-clamp-2 min-h-[1.25rem]">
            {variantLabel || "\u00A0"}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 mt-3">
        <div className="h-px bg-gray-100 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {showFromPrice && <span className="text-xs text-gray-400">From</span>}
            <span className="text-xl font-bold text-black">{formatPrice(product.starting_price)}</span>
          </div>
          <button
            type="button"
            aria-label={
              !inStock
                ? "Sold out"
                : isAtCartLimit
                  ? "All available stock is already in your cart"
                  : product.variants.length > 1
                    ? "Choose options"
                    : "Add to cart"
            }
            onClick={handleAddToCart}
            disabled={!inStock || isBusy || isAtCartLimit}
            className={cn(
              "relative z-10 flex items-center justify-center w-11 h-11 rounded-full shadow-sm transition-colors",
              !inStock || isBusy || isAtCartLimit
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-primary-normal text-black hover:opacity-90"
            )}
          >
            <Icon
              icon={isBusy ? "svg-spinners:180-ring" : isAtCartLimit ? "solar:check-circle-bold" : "solar:cart-plus-outline"}
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
