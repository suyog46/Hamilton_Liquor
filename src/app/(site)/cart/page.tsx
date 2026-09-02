"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cartApiSlice,
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  type CartProductVariant,
} from "@/redux/features/cart/cartApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";
import { useCartStore, useCartHydrated } from "@/lib/stores/cartStore";
import { getCartItemCount } from "@/lib/utils/cartDisplay";
import { formatAbv, formatPrice, formatVolume } from "@/lib/utils/productDisplay";
import { useAppDispatch } from "@/redux/hooks";
import { apiSlice } from "@/redux/apiSlice";

interface DisplayLine {
  id: string;
  quantity: number;
  product_variant: CartProductVariant;
}

const CartPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: meData } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;

  const { data, isLoading } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const [updateCartItem, { isLoading: isUpdatingCart }] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const setCartCount = useCartStore((s) => s.setCount);
  const guestItems = useCartStore((s) => s.guestItems);
  const updateGuestItem = useCartStore((s) => s.updateGuestItem);
  const removeGuestItem = useCartStore((s) => s.removeGuestItem);
  const hasHydrated = useCartHydrated();

  const cart = data?.data;

  useEffect(() => {
    if (isLoggedIn && cart) setCartCount(getCartItemCount(cart));
  }, [isLoggedIn, cart, setCartCount]);

  const items: DisplayLine[] = isLoggedIn
    ? cart?.items ?? []
    : guestItems.map((item) => ({ id: item.variant.id, quantity: item.quantity, product_variant: item.variant }));

  const updateQty = async (line: DisplayLine, quantity: number) => {
    const nextQuantity = Math.max(1, Math.min(quantity, line.product_variant.quantity));
    if (nextQuantity === line.quantity) return;

    if (!isLoggedIn) {
      updateGuestItem(line.id, nextQuantity);
      return;
    }

    const previousCount = useCartStore.getState().count;
    const delta = nextQuantity - line.quantity;
    const optimisticPatch = dispatch(
      cartApiSlice.util.updateQueryData("getCart", undefined, (draft) => {
        const item = draft.data.items.find((cartItem) => cartItem.id === line.id);
        if (item) item.quantity = nextQuantity;
      })
    );
    setCartCount(previousCount + delta);

    try {
      const response = await updateCartItem({ item_id: line.id, quantity: nextQuantity }).unwrap();
      setCartCount(getCartItemCount(response.data));
      dispatch(cartApiSlice.util.upsertQueryData("getCart", undefined, response));
      dispatch(apiSlice.util.invalidateTags([
        { type: "Product", id: line.product_variant.product.id },
        { type: "Product", id: "PUBLIC_LIST" },
      ]));
    } catch {
      optimisticPatch.undo();
      setCartCount(previousCount);
      toast.error("Failed to update quantity.");
    }
  };

  const removeLine = async (line: DisplayLine) => {
    if (!isLoggedIn) {
      removeGuestItem(line.id);
      return;
    }
    try {
      await removeCartItem(line.id).unwrap();
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error("You are not logged in. Log in first.");
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  const showSkeleton = isLoggedIn ? isLoading : !hasHydrated;

  return (
    <>
      <PageBanner eyebrow="Review Order" title="Your Cart" breadcrumbs={[{ name: "Cart" }]} />

      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          {showSkeleton ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <Icon icon="solar:cart-large-minimalistic-linear" className="w-12 h-12 text-gray-300" />
              <p className="text-sm text-gray-500">Your cart is empty.</p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mx-auto flex max-w-4xl flex-col gap-8">
              {/* Cart lines */}
              <div className="flex flex-col gap-4">
                {items.map((line) => {
                  const variant = line.product_variant;
                  const media = variant.thumbnail;
                  return (
                    <div
                      key={line.id}
                      className="flex gap-4 p-4 rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                        {media?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.url}
                            alt={variant.product.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                            <Icon icon="solar:bottle-linear" className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/shop/${variant.product.slug}`}
                              className="font-title text-sm sm:text-base font-semibold text-black truncate hover:text-primary-normal transition-colors"
                            >
                              {variant.product.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatVolume(variant.volume_ml)}
                              {variant.alcohol_percentage && <> &middot; {formatAbv(variant.alcohol_percentage)}</>}
                            </p>
                          </div>
                          <button
                            aria-label="Remove item"
                            onClick={() => removeLine(line)}
                            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Icon icon="solar:trash-bin-minimalistic-linear" className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-2 py-1">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQty(line, line.quantity - 1)}
                              disabled={line.quantity <= 1 || (isLoggedIn && isUpdatingCart)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                            >
                              <Icon icon="solar:minus-circle-linear" className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold w-4 text-center">{line.quantity}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQty(line, line.quantity + 1)}
                              disabled={line.quantity >= variant.quantity || (isLoggedIn && isUpdatingCart)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                            >
                              <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-black">
                            {formatPrice(Number(variant.price) * line.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-normal hover:opacity-80 mt-2 w-fit"
                >
                  <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
                <Button
                  type="button"
                  onClick={handleCheckout}
                  className="h-12 w-full rounded-lg bg-primary-normal text-sm font-semibold text-black hover:bg-primary-hover sm:w-auto sm:min-w-64"
                >
                  Proceed to Checkout
                </Button>
                <p className="text-xs text-gray-500">Review delivery and payment details on the next step.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CartPage;
