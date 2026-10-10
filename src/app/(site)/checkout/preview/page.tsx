"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCheckoutStore } from "@/lib/stores/checkoutStore";
import { useCartStore, type CartStore } from "@/lib/stores/cartStore";
import { formatVolume } from "@/lib/utils/productDisplay";
import { formatStoreTime } from "@/lib/utils";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useCheckoutMutation } from "@/redux/features/order/orderApiSlice";
import { useClearCartMutation } from "@/redux/features/cart/cartApiSlice";
import RefundPolicyDialog from "@/components/Common/RefundPolicy/RefundPolicyDialog";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatMoney = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? moneyFormatter.format(amount) : "$0.00";
};

const hasSalePrice = (saleUnitPrice: string | null) =>
  saleUnitPrice !== null && saleUnitPrice !== "";

const formatPreviewTime = (value: string | null) => {
  if (!value) return null;
  const timeValue = value.includes("T") ? value.split("T")[1] : value;
  return formatStoreTime(timeValue);
};

const checkoutErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error))
    return "We couldn't start checkout. Please try again.";
  const data = error.data as
    | { error?: { message?: string; details?: Array<{ message?: string }> } }
    | undefined;
  return (
    data?.error?.details?.find((detail) => detail.message)?.message ??
    data?.error?.message ??
    "We couldn't start checkout. Please try again."
  );
};

const CheckoutPreviewPage = () => {
  const router = useRouter();
  const previewResponse = useCheckoutStore((state) => state.previewResponse);
  const paymentRequest = useCheckoutStore((state) => state.paymentRequest);
  const idempotencyKey = useCheckoutStore((state) => state.idempotencyKey);
  const clearPreview = useCheckoutStore((state) => state.clearPreview);
  const [checkout, { isLoading }] = useCheckoutMutation();
  const [clearCart] = useClearCartMutation();
  const setCartCount = useCartStore((state: CartStore) => state.setCount);
  const clearGuestItems = useCartStore((state: CartStore) => state.clearGuestItems);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  useEffect(() => {
    if (!previewResponse || !paymentRequest || !idempotencyKey) {
      router.replace("/checkout");
    }
  }, [idempotencyKey, paymentRequest, previewResponse, router]);

  if (!previewResponse || !paymentRequest || !idempotencyKey) return null;

  const preview = previewResponse.data;
  const expected = preview.expected_checkout;
  const pickupStart = formatPreviewTime(preview.pickup_start_time);
  const pickupEnd = formatPreviewTime(preview.pickup_end_time);

  const continueToPayment = async () => {
    if (isRedirecting) return;
    try {
      const response = await checkout({
        body: paymentRequest,
        idempotencyKey,
      }).unwrap();
      if (!response.data.checkout_url) throw new Error("Missing checkout URL");

      setIsRedirecting(true);
      toast.info("Payment session created! Redirecting to payment, please wait a few moments...");

      try {
        await clearCart().unwrap();
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
      clearGuestItems();
      setCartCount(0);

      clearPreview();
      window.location.assign(response.data.checkout_url);
    } catch (error) {
      setIsRedirecting(false);
      toast.error(checkoutErrorMessage(error));
    }
  };

  return (
    <>
      <PageBanner
        eyebrow="Secure checkout"
        title="Review billing"
        breadcrumbs={[
          { name: "Cart", href: "/cart" },
          { name: "Checkout", href: "/checkout" },
          { name: "Review" },
        ]}
      />

      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-title text-2xl font-semibold">
                  Final billing information
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Review the calculated prices before continuing to payment.
                </p>
              </div>
              <Badge variant="secondary" className="w-fit">
                {preview.fulfillment_method === "PICKUP" ? "Pickup" : "Delivery"}
              </Badge>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              {preview.fulfillment_method === "PICKUP" ? (
                <p>
                  <span className="font-semibold">Pickup:</span>{" "}
                  {preview.pickup_date}
                  {pickupStart && pickupEnd ? `, ${pickupStart} - ${pickupEnd}` : ""}
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Delivery:</span>{" "}
                  {preview.delivery_date}
                </p>
              )}
            </div>

            <div className="mt-6 divide-y divide-gray-100">
              {preview.items.map((item) => {
                const salePrice = hasSalePrice(item.sale_unit_price);
                return (
                  <div
                    key={item.product_variant_id}
                    className="flex flex-col gap-3 py-5 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{item.product_name}</p>
                        {!item.is_available && (
                          <Badge variant="destructive">Unavailable</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.variant_name} · SKU {item.sku}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Qty {item.quantity}
                        {item.volume_ml > 0 ? ` · ${formatVolume(item.volume_ml)}` : ""}
                        {Number(item.alcohol_percentage) > 0
                          ? ` · ${Number(item.alcohol_percentage)}% ABV`
                          : ""}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-2 sm:justify-end">
                        {salePrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatMoney(item.regular_unit_price || item.unit_price)}
                          </span>
                        )}
                        <span className="text-sm font-semibold">
                          {formatMoney(
                            salePrice ? item.sale_unit_price : item.unit_price,
                          )}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Line total {formatMoney(item.line_total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">
                    {formatMoney(expected.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery fee</span>
                  <span className="font-semibold">
                    {formatMoney(expected.delivery_fee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">{formatMoney(expected.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 text-xs text-gray-700">
              <div className="flex items-start gap-2.5">
                <Icon
                  icon="solar:shield-warning-bold"
                  className="mt-0.5 size-4 shrink-0 text-amber-600"
                />
                <div className="space-y-1">
                  <span className="font-semibold text-gray-900">
                    Hamilton Liquor Store Refund Policy
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    Unopened items in original condition may be refunded within 24 hours (or 1 business day) when brought in-store. Opened bottles cannot be refunded.{" "}
                    <button
                      type="button"
                      onClick={() => setRefundModalOpen(true)}
                      className="font-semibold text-black underline underline-offset-2 hover:text-primary-dark transition-colors cursor-pointer"
                    >
                      View full Refund &amp; Return Policy
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Button
                variant="outline"
                className="h-12"
                disabled={isLoading || isRedirecting}
                render={<Link href="/checkout" />}
              >
                Back
              </Button>
              <div className="flex flex-col items-stretch sm:items-end gap-2">
                <p className="text-xs text-gray-500 text-left sm:text-right">
                  Please review our{" "}
                  <button
                    type="button"
                    onClick={() => setRefundModalOpen(true)}
                    className="font-semibold text-gray-900 underline underline-offset-2 hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    Refund &amp; Return Policy
                  </button>{" "}
                  before completing payment.
                </p>
                <Button
                  type="button"
                  onClick={continueToPayment}
                  disabled={isLoading || isRedirecting}
                  className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {(isLoading || isRedirecting) && (
                    <Icon icon="svg-spinners:180-ring" className="size-4 mr-2" />
                  )}
                  {isRedirecting
                    ? "Redirecting to payment..."
                    : "Continue to payment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RefundPolicyDialog
        open={refundModalOpen}
        onOpenChange={setRefundModalOpen}
      />
    </>
  );
};

export default CheckoutPreviewPage;
