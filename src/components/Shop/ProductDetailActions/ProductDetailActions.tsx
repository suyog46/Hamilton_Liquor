"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPrimaryVariantMedia, type ProductVariant } from "@/redux/features/product/productApiSlice";
import { isVariantInStock } from "@/lib/utils/productDisplay";
import { cartApiSlice, useAddToCartMutation, useGetCartQuery } from "@/redux/features/cart/cartApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";
import { useCartStore } from "@/lib/stores/cartStore";
import { getCartItemCount } from "@/lib/utils/cartDisplay";
import { useAppDispatch } from "@/redux/hooks";
import { apiSlice } from "@/redux/apiSlice";

interface ProductRef {
  id: string;
  name: string;
  slug: string;
}

const ProductDetailActions = ({ variant, product }: { variant: ProductVariant | null; product: ProductRef }) => {
  const [qty, setQty] = useState(1);
  const dispatch = useAppDispatch();
  const [inCart, setInCart] = useState(false);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const setCartCount = useCartStore((s) => s.setCount);
  const cartCount = useCartStore((s) => s.count);
  const addGuestItem = useCartStore((s) => s.addGuestItem);
  const guestItems = useCartStore((s) => s.guestItems);
  const openCartSheet = useCartStore((s) => s.openCartSheet);
  const { data: meData } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isLoggedIn });

  const inStock = isVariantInStock(variant);
  const quantityInCart = variant
    ? isLoggedIn
      ? cartData?.data.items.find((item) => item.product_variant.id === variant.id)?.quantity ?? 0
      : guestItems.find((item) => item.variant.id === variant.id)?.quantity ?? 0
    : 0;
  const remainingQuantity = variant ? Math.max(0, variant.quantity - quantityInCart) : 0;
  const maxQty = Math.max(1, Math.min(24, remainingQuantity));
  const isAtCartLimit = !!variant && remainingQuantity === 0;

  const handleAddToCart = async () => {
    if (!variant || !inStock || isAtCartLimit) return;

    // A cart line only needs a single thumbnail, so flatten the variant's
    // ordered media array down to its cover image.
    const cartMedia = getPrimaryVariantMedia(variant.media) ?? { id: variant.id, url: "" };

    // Guests build their cart locally — the real cart API requires auth on
    // every endpoint, so there's nothing to call until they sign in.
    if (!isLoggedIn) {
      addGuestItem({ ...variant, product, media: cartMedia }, qty);
      setInCart(true);
      toast.success(`Added ${qty} to cart.`);
      openCartSheet();
      return;
    }

    const previousCount = cartCount;
    const cartVariant = { ...variant, product, media: cartMedia };
    const now = new Date().toISOString();
    const optimisticPatch = dispatch(
      cartApiSlice.util.updateQueryData("getCart", undefined, (draft) => {
        const existing = draft.data.items.find((item) => item.product_variant.id === variant.id);
        if (existing) {
          existing.quantity += qty;
        } else {
          draft.data.items.push({
            id: `optimistic:${variant.id}`,
            quantity: qty,
            product_variant: cartVariant,
            created_at: now,
            updated_at: now,
          });
        }
      })
    );
    setCartCount(previousCount + qty);
    setInCart(true);
    openCartSheet();

    try {
      const res = await addToCart({ product_variant_id: variant.id, quantity: qty }).unwrap();
      setCartCount(getCartItemCount(res.data));
      dispatch(cartApiSlice.util.upsertQueryData("getCart", undefined, res));
      dispatch(apiSlice.util.invalidateTags([{ type: "Product", id: product.id }, { type: "Product", id: "PUBLIC_LIST" }]));
      toast.success(`Added ${qty} to cart.`);
    } catch {
      optimisticPatch.undo();
      setCartCount(previousCount);
      setInCart(false);
      toast.error("Failed to add to cart. Please try again.");
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
            disabled={!inStock || isAtCartLimit}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            <Icon icon="solar:minus-circle-linear" className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold w-5 text-center">{qty}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQty((prev) => Math.min(maxQty, prev + 1))}
            disabled={!inStock || isAtCartLimit || qty >= maxQty}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            <Icon icon="solar:add-circle-linear" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!inStock || isAtCartLimit || isAdding}
        className={cn(
          "flex items-center justify-center gap-2 h-12 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto sm:px-10",
          !inStock || isAtCartLimit || isAdding
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : inCart
            ? "bg-black text-white"
            : "bg-primary-normal text-black hover:opacity-90"
        )}
      >
        <Icon
          icon={isAdding ? "svg-spinners:180-ring" : inCart || isAtCartLimit ? "solar:check-circle-bold" : "solar:cart-plus-outline"}
          className="w-5 h-5"
        />
        {!inStock
          ? "Sold Out"
          : isAtCartLimit
            ? "All Available Stock Is in Your Cart"
            : isAdding
              ? "Adding..."
              : inCart
                ? `Added ${qty} to Cart`
                : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductDetailActions;
