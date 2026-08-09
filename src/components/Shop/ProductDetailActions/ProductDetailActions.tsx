"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/redux/features/product/productApiSlice";
import { isVariantInStock } from "@/lib/utils/productDisplay";
import { useAddToCartMutation } from "@/redux/features/cart/cartApiSlice";
import { useCartStore } from "@/lib/stores/cartStore";
import { getCartItemCount } from "@/lib/utils/cartDisplay";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const ProductDetailActions = ({ variant }: { variant: ProductVariant | null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [qty, setQty] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const setCartCount = useCartStore((s) => s.setCount);

  const inStock = isVariantInStock(variant);
  const maxQty = variant ? Math.min(24, variant.quantity) : 1;

  const handleAddToCart = async () => {
    if (!variant || !inStock) return;

    try {
      const res = await addToCart({ product_variant_id: variant.id, quantity: qty }).unwrap();
      setCartCount(getCartItemCount(res.data));
      setInCart(true);
      toast.success(`Added ${qty} to cart.`);
    } catch (err) {
      if (isFetchBaseQueryError(err) && err.status === 401) {
        toast.error("You are not logged in. Log in first.");
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        toast.error("Failed to add to cart. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</span>
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 px-3 py-2">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            disabled={!inStock}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            <Icon icon="solar:minus-circle-linear" className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold w-5 text-center">{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQty((prev) => Math.min(maxQty, prev + 1))}
            disabled={!inStock}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            <Icon icon="solar:add-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!inStock || isAdding}
        className={cn(
          "flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto sm:px-10",
          !inStock || isAdding
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : inCart
            ? "bg-black text-white"
            : "bg-primary-normal text-black hover:opacity-90"
        )}
      >
        <Icon
          icon={isAdding ? "svg-spinners:180-ring" : inCart ? "solar:check-circle-bold" : "solar:cart-plus-outline"}
          className="w-5 h-5"
        />
        {!inStock ? "Sold Out" : isAdding ? "Adding..." : inCart ? `Added ${qty} to Cart` : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductDetailActions;
