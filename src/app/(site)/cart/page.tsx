"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products } from "@/lib/utils/products";

interface CartLine {
  productId: string;
  qty: number;
}

const seedCart: CartLine[] = [
  { productId: "p1", qty: 1 },
  { productId: "p2", qty: 2 },
  { productId: "p7", qty: 1 },
];

const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 200;
const DELIVERY_MINIMUM = 30;

const CartPage = () => {
  const [lines, setLines] = useState<CartLine[]>(seedCart);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");

  const cartItems = lines
    .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
    .filter((item): item is { line: CartLine; product: (typeof products)[number] } => Boolean(item.product));

  const updateQty = (productId: string, delta: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, qty: Math.max(1, line.qty + delta) } : line
      )
    );
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.line.qty, 0);
  const deliveryFee = fulfillment === "delivery" && subtotal > 0 ? (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE) : 0;
  const total = subtotal + deliveryFee;

  return (
    <>
      <PageBanner eyebrow="Review Order" title="Your Cart" breadcrumbs={[{ name: "Cart" }]} />

      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          {cartItems.length === 0 ? (
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
                {cartItems.map(({ line, product }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-4 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                      <Image src={product.image} alt={product.name} fill sizes="120px" className="object-cover" />
                    </div>

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-400 uppercase tracking-wide truncate">{product.brand}</p>
                          <h3 className="font-title text-sm sm:text-base font-semibold text-black truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {product.category} &middot; {product.volume}
                          </p>
                        </div>
                        <button
                          aria-label="Remove item"
                          onClick={() => removeLine(product.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                        >
                          <Icon icon="solar:trash-bin-minimalistic-linear" className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-2 py-1">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                          >
                            <Icon icon="solar:minus-circle-linear" className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-semibold w-4 text-center">{line.qty}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQty(product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                          >
                            <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-sm sm:text-base font-bold text-black">
                          ${(product.price * line.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

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
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>{fulfillment === "delivery" ? "Delivery Fee" : "Pickup Fee"}</span>
                    <span>{fulfillment === "delivery" ? (deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`) : "Free"}</span>
                  </div>
                  <div className="flex items-center justify-between text-black font-bold text-base pt-2 border-t border-gray-200">
                    <span>Estimated Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="button"
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
