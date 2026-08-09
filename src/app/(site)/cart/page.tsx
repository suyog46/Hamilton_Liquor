"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from "@/redux/features/cart/cartApiSlice";
import { useCartStore } from "@/lib/stores/cartStore";
import { getCartItemCount, getCartSubtotal } from "@/lib/utils/cartDisplay";
import { formatAbv, formatPrice, formatVolume } from "@/lib/utils/productDisplay";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 200;
const DELIVERY_MINIMUM = 30;

const CartPage = () => {
  const router = useRouter();
  const { data, isLoading, isFetching, error } = useGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const setCartCount = useCartStore((s) => s.setCount);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");

  const cart = data?.data;
  const unauthorized = isFetchBaseQueryError(error) && error.status === 401;

  useEffect(() => {
    if (cart) setCartCount(getCartItemCount(cart));
  }, [cart, setCartCount]);

  const updateQty = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ item_id: itemId, quantity: Math.max(1, quantity) }).unwrap();
    } catch {
      toast.error("Failed to update quantity.");
    }
  };

  const removeLine = async (itemId: string) => {
    try {
      await removeCartItem(itemId).unwrap();
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleCheckout = () => {
    if (unauthorized || !cart) {
      toast.error("You are not logged in. Log in first.");
      router.push("/login?redirect=/cart");
      return;
    }
    toast.info("Checkout isn't available yet — check back soon.");
  };

  const items = cart?.items ?? [];
  const subtotal = cart ? getCartSubtotal(cart) : 0;
  const deliveryFee =
    fulfillment === "delivery" && subtotal > 0 ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE) : 0;
  const total = subtotal + deliveryFee;

  return (
    <>
      <PageBanner eyebrow="Review Order" title="Your Cart" breadcrumbs={[{ name: "Cart" }]} />

      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-96 w-full rounded-2xl" />
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
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
              {/* Cart lines */}
              <div className="flex flex-col gap-4">
                {items.map((item) => {
                  const { product_variant: variant } = item;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                        {variant.media?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={variant.media.url}
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
                              {formatVolume(variant.volume_ml)} &middot; {formatAbv(variant.alcohol_percentage)}
                            </p>
                          </div>
                          <button
                            aria-label="Remove item"
                            onClick={() => removeLine(item.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Icon icon="solar:trash-bin-minimalistic-linear" className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-2 py-1">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                            >
                              <Icon icon="solar:minus-circle-linear" className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              disabled={item.quantity >= variant.quantity}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                            >
                              <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-black">
                            {formatPrice(Number(variant.price) * item.quantity)}
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

              {/* Order summary */}
              <div className="flex flex-col gap-5 p-6 rounded-2xl bg-gray-50 border border-gray-100 lg:sticky lg:top-28">
                <h2 className="font-title text-lg font-semibold text-black">Order Summary</h2>

                {/* Pickup / delivery */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fulfillment</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFulfillment("pickup")}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        fulfillment === "pickup"
                          ? "border-primary-normal bg-primary-normal/10 text-black"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <Icon icon="solar:bag-check-outline" className="w-5 h-5" />
                      Pickup
                    </button>
                    <button
                      onClick={() => setFulfillment("delivery")}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        fulfillment === "delivery"
                          ? "border-primary-normal bg-primary-normal/10 text-black"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <Icon icon="solar:delivery-outline" className="w-5 h-5" />
                      Delivery
                    </button>
                  </div>
                  {fulfillment === "delivery" && (
                    <p className="text-xs text-gray-500">
                      ${DELIVERY_FEE.toFixed(2)} delivery fee &middot; free over ${FREE_DELIVERY_THRESHOLD} &middot; $
                      {DELIVERY_MINIMUM} order minimum
                    </p>
                  )}
                </div>

                {/* Coupon */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coupon Code</span>
                  <div className="flex gap-2">
                    <Input type="text" placeholder="Enter code" className="h-11 rounded-lg text-sm bg-white border-gray-200" />
                    <Button type="button" variant="outline" className="h-11 rounded-lg px-4 text-sm shrink-0">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>{fulfillment === "delivery" ? "Delivery Fee" : "Pickup Fee"}</span>
                    <span>{fulfillment === "delivery" ? (deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)) : "Free"}</span>
                  </div>
                  <div className="flex items-center justify-between text-black font-bold text-base pt-2 border-t border-gray-200">
                    <span>Estimated Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isFetching}
                  className="h-12 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 w-full"
                >
                  Proceed to Checkout
                </Button>

                <p className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                  <Icon icon="solar:shield-check-linear" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  You must be 21+ with a valid government-issued photo ID to complete this order. We may refuse
                  service if age cannot be verified.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CartPage;
