"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCheckoutStore } from "@/lib/stores/checkoutStore";
import { formatVolume } from "@/lib/utils/productDisplay";
import { formatStoreTime } from "@/lib/utils";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { useCheckoutMutation } from "@/redux/features/order/orderApiSlice";

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
    try {
      const response = await checkout({
        body: paymentRequest,
        idempotencyKey,
      }).unwrap();
      if (!response.data.checkout_url) throw new Error("Missing checkout URL");
      clearPreview();
      window.location.assign(response.data.checkout_url);
    } catch (error) {
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

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                className="h-12"
                render={<Link href="/checkout" />}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={continueToPayment}
                disabled={isLoading}
                className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover"
              >
                {isLoading && (
                  <Icon icon="svg-spinners:180-ring" className="size-4" />
                )}
                Continue to payment
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutPreviewPage;
