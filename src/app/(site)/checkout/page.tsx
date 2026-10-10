"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import AddressSection from "@/components/Profile/AddressSection";
import DateOptionPicker, {
  getTodayValue,
} from "@/components/Checkout/DateOptionPicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatInTimeZone } from "date-fns-tz";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { cn, formatStoreTime } from "@/lib/utils";
import { siteConfig } from "@/lib/utils/siteConfig";
import { useCheckoutStore } from "@/lib/stores/checkoutStore";
import { useGetAddressesQuery } from "@/redux/features/address/addressApiSlice";
import { useGetCartQuery } from "@/redux/features/cart/cartApiSlice";
import {
  type ExpectedCheckout,
  type FulfillmentMethod,
  useCheckoutPreviewMutation,
} from "@/redux/features/order/orderApiSlice";
import {
  type DayOfWeek,
  type OperatingHour,
  useGetPublicDeliverySlotsQuery,
  useGetPublicOperatingHoursQuery,
} from "@/redux/features/store/storeApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";

interface TimeSlot {
  value: string;
  label: string;
  start: string;
  end: string;
}

const DAY_OF_WEEK_BY_INDEX: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const STORE_TIMEZONE = "America/New_York";

// A delivery slot's start_time is a time-of-day only ("HH:MM:SS") — when
// showing today's slots, anything at or before the current Baltimore time is disabled
// rather than hidden, so the list of times stays stable.
const isSlotPastForToday = (startTime: string, isToday: boolean) => {
  if (!isToday) return false;
  const currentBaltimoreTime = formatInTimeZone(
    new Date(),
    STORE_TIMEZONE,
    "HH:mm",
  );
  return startTime.slice(0, 5) <= currentBaltimoreTime;
};

const toTimeValue = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
};

// Pickup has no persisted "slot" resource — it's just the store's regular
// operating hours, cut into hourly windows for the chosen date.
const buildPickupSlots = (
  dateValue: string,
  hours: OperatingHour[],
): TimeSlot[] => {
  if (!dateValue || hours.length === 0) return [];

  const date = new Date(`${dateValue}T00:00:00`);
  const dayOfWeek = DAY_OF_WEEK_BY_INDEX[date.getDay()];
  const today = hours.find((hour) => hour.day_of_week === dayOfWeek);
  if (!today || today.is_closed || !today.open_time || !today.close_time) {
    return [];
  }

  const [openHour, openMinute] = today.open_time.slice(0, 5).split(":").map(Number);
  const [closeHour, closeMinute] = today.close_time.slice(0, 5).split(":").map(Number);
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  const isToday = dateValue === getTodayValue();
  const currentBaltimoreTime = formatInTimeZone(
    new Date(),
    STORE_TIMEZONE,
    "HH:mm",
  );
  const [nowHour, nowMinute] = currentBaltimoreTime.split(":").map(Number);
  const earliestMinutes = nowHour * 60 + nowMinute + 60;

  const slots: TimeSlot[] = [];
  for (let minutes = openMinutes; minutes + 60 <= closeMinutes; minutes += 60) {
    if (isToday && minutes < earliestMinutes) continue;
    const start = toTimeValue(minutes);
    const end = toTimeValue(minutes + 60);
    slots.push({
      value: start,
      label: `${formatStoreTime(start)} – ${formatStoreTime(end)}`,
      start,
      end,
    });
  }

  return slots;
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

const numberOrNull = (value: string | null) =>
  value === null || value === "" ? null : Number(value);

const buildExpectedCheckoutInput = (expected: ExpectedCheckout) => ({
  items: expected.items.map((item) => ({
    product_variant_id: item.product_variant_id,
    quantity: item.quantity,
    regular_unit_price: Number(item.regular_unit_price),
    sale_id: item.sale_id,
    sale_percentage: numberOrNull(item.sale_percentage),
    sale_unit_price: numberOrNull(item.sale_unit_price),
    unit_price: Number(item.unit_price),
    line_total: Number(item.line_total),
  })),
  subtotal: Number(expected.subtotal),
  delivery_fee: Number(expected.delivery_fee),
  total: Number(expected.total),
  currency: expected.currency,
});

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<FulfillmentMethod>("PICKUP");
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState("");
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState(getTodayValue);
  const [pickupSlotValue, setPickupSlotValue] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(getTodayValue);
  const [deliverySlotId, setDeliverySlotId] = useState("");
  const [instructions, setInstructions] = useState("");
  const setCheckoutPreview = useCheckoutStore((state) => state.setPreview);

  const {
    data: meData,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useGetMeQuery();

  const isLoggedIn = !!meData?.data;
  const { data: cartData, isLoading: isLoadingCart } = useGetCartQuery(
    undefined,
    { skip: !isLoggedIn },
  );
  const { data: addressData, isLoading: isLoadingAddresses } =
    useGetAddressesQuery({ page: 1, limit: 100 }, { skip: !isLoggedIn });
  const { data: hoursData } = useGetPublicOperatingHoursQuery();
  const isDeliveryToday = deliveryDate === getTodayValue();
  const { data: deliverySlotsData, isFetching: isLoadingDeliverySlots } =
    useGetPublicDeliverySlotsQuery(
      { date: isDeliveryToday ? "today" : "tomorrow" },
      { skip: !isLoggedIn || method !== "DELIVERY" || !deliveryDate },
    );
  const [checkoutPreview, { isLoading: isPreviewing }] =
    useCheckoutPreviewMutation();

  const pickupSlots = useMemo(
    () => buildPickupSlots(pickupDate, hoursData?.data.hours ?? []),
    [pickupDate, hoursData],
  );
  const deliverySlots = deliverySlotsData?.data.items ?? [];
  const selectedPickupSlot = pickupSlots.find((slot) => slot.value === pickupSlotValue);
  const selectedDeliverySlot = deliverySlots.find(
    (slot) =>
      slot.id === deliverySlotId && !isSlotPastForToday(slot.start_time, isDeliveryToday),
  );

  const cart = cartData?.data;
  const addresses = addressData?.data.items ?? [];
  useEffect(() => {
    if (!isLoadingUser && (isUserError || !meData?.data)) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isLoadingUser, isUserError, meData, router]);

  useEffect(() => {
    if (!addressId && addresses.length > 0) {
      setAddressId(
        addresses.find((address) => address.is_default)?.id ?? addresses[0].id,
      );
    }
  }, [addressId, addresses]);

  const selectMethod = (nextMethod: FulfillmentMethod) => {
    setMethod(nextMethod);
    setStep(1);
    setPickupSlotValue("");
    setDeliverySlotId("");
  };

  const changePickupDate = (date: string) => {
    setPickupDate(date);
    setPickupSlotValue("");
  };

  const changeDeliveryDate = (date: string) => {
    setDeliveryDate(date);
    setDeliverySlotId("");
  };

  const continueToPreview = async () => {
    if (!cart?.items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    if (method === "PICKUP" && !selectedPickupSlot) {
      toast.error("Choose an available pickup time.");
      return;
    }
    if (method === "DELIVERY" && !addressId) {
      toast.error("Choose a delivery address.");
      setStep(2);
      return;
    }
    if (method === "DELIVERY" && !selectedDeliverySlot) {
      toast.error("Choose an available delivery time.");
      return;
    }

    try {
      const items = cart.items.map((item) => ({
        product_variant_id: item.product_variant.id,
        quantity: item.quantity,
      }));
      const previewRequest =
        method === "PICKUP"
          ? {
            items,
            fulfillment_method: method,
            pickup_date: pickupDate,
            pickup_start_time: selectedPickupSlot!.start,
            pickup_end_time: selectedPickupSlot!.end,
          }
          : {
            items,
            fulfillment_method: method,
            address_id: addressId,
            handoff_instructions: instructions.trim(),
            delivery_date: deliveryDate,
            delivery_slot_id: selectedDeliverySlot!.id,
          };
      const previewResponse = await checkoutPreview(previewRequest).unwrap();
      const paymentRequest = {
        ...previewRequest,
        expected_checkout: buildExpectedCheckoutInput(
          previewResponse.data.expected_checkout,
        ),
      };
      const idempotencyKey = crypto.randomUUID();

      setCheckoutPreview({
        previewResponse,
        previewRequest,
        paymentRequest,
        idempotencyKey,
      });

      router.push("/checkout/preview");
    } catch (error) {
      toast.error(checkoutErrorMessage(error));
    }
  };

  if (isLoadingUser || (isLoggedIn && isLoadingCart)) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-32">
        <Skeleton className="h-[560px] rounded-2xl" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  if (!cart?.items.length) {
    return (
      <>
        <PageBanner
          eyebrow="Secure checkout"
          title="Checkout"
          breadcrumbs={[{ name: "Checkout" }]}
        />
        <section className="px-6 py-24 text-center">
          <Icon
            icon="solar:cart-large-minimalistic-linear"
            className="mx-auto size-12 text-gray-300"
          />
          <h2 className="mt-4 font-title text-2xl font-semibold">
            Your cart is empty
          </h2>
          <Link
            href="/shop"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary-normal px-6 text-sm font-semibold text-black hover:bg-primary-hover"
          >
            Continue shopping
          </Link>
        </section>
      </>
    );
  }

  const totalSteps = method === "PICKUP" ? 1 : 3;

  return (
    <>
      <PageBanner
        eyebrow="Secure checkout"
        title="Checkout"
        breadcrumbs={[{ name: "Cart", href: "/cart" }, { name: "Checkout" }]}
      />
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-6">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold">
                Step {step} of {totalSteps}
              </p>
              <p className="text-xs text-gray-500">
                Valid photo ID required at handoff
              </p>
            </div>
            <div className="mb-8 flex gap-2" aria-hidden="true">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${index < step ? "bg-primary-normal" : "bg-gray-200"}`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <h2 className="font-title text-2xl font-semibold">
                  How would you like your order?
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Choose pickup or local delivery.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      value: "PICKUP" as const,
                      title: "Store pickup",
                      description: `Pick up at ${siteConfig.address.full}`,
                      icon: "solar:bag-check-outline",
                    },
                    {
                      value: "DELIVERY" as const,
                      title: "Delivery",
                      description: "Delivered to one of your saved addresses",
                      icon: "solar:delivery-outline",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      role="radio"
                      aria-checked={method === option.value}
                      tabIndex={0}
                      onClick={() => selectMethod(option.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectMethod(option.value);
                        }
                      }}
                      className={`flex min-h-40 cursor-pointer flex-col items-start rounded-xl border-2 p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal ${method === option.value ? "border-primary-normal bg-primary-normal/5" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <span className="flex w-full items-start justify-between">
                        <Icon
                          icon={option.icon}
                          className="size-8 text-primary-normal"
                        />
                        <Checkbox
                          checked={method === option.value}
                          aria-label={`Choose ${option.title}`}
                          tabIndex={-1}
                        />
                      </span>
                      <span className="mt-5 font-semibold">{option.title}</span>
                      <span className="mt-1 text-xs leading-5 text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  ))}
                </div>

                {method === "PICKUP" && (
                  <>
                    <div className="mt-7">
                      <label className="mb-2 block text-sm font-semibold">
                        Pickup date
                      </label>
                      <DateOptionPicker
                        value={pickupDate}
                        onChange={changePickupDate}
                      />
                    </div>
                    <div className="mt-5">
                      <label className="mb-1 block text-sm font-semibold">
                        Pickup time
                      </label>
                      <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-900 border border-amber-200/80">
                        <Icon icon="solar:info-circle-linear" className="size-4 shrink-0 text-amber-600" />
                        <span><strong>Note:</strong> All pickup times are local to our store in Baltimore.</span>
                      </div>
                      {pickupSlots.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                          We&apos;re closed or fully booked on this date —
                          choose another day.
                        </p>
                      ) : (
                        <Select
                          value={pickupSlotValue || null}
                          onValueChange={(value) => setPickupSlotValue(value ?? "")}
                        >
                          <SelectTrigger className="h-12 w-full rounded-lg border-gray-200 px-4 text-sm">
                            <SelectValue placeholder="Choose an available pickup time" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {pickupSlots.map((slot) => (
                              <SelectItem
                                key={slot.value}
                                value={slot.value}
                                className="py-3"
                              >
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-8 flex justify-end">
                  {method === "DELIVERY" ? (
                    <Button
                      onClick={() => setStep(2)}
                      className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover"
                    >
                      Continue to address
                    </Button>
                  ) : (
                    <Button
                      onClick={continueToPreview}
                      disabled={!pickupSlotValue || isPreviewing}
                      className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover"
                    >
                      {isPreviewing && (
                        <Icon icon="svg-spinners:180-ring" className="size-4" />
                      )}
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === 2 && method === "DELIVERY" && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-title text-2xl font-semibold">
                      Choose a delivery address
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Select from your saved addresses.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddressModalOpen(true)}
                    className="shrink-0 gap-1.5"
                  >
                    <Icon icon="solar:add-circle-linear" className="size-4" />
                    Add / manage
                  </Button>
                </div>
                {isLoadingAddresses ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
                    <Icon
                      icon="solar:map-point-linear"
                      className="mx-auto size-9 text-gray-300"
                    />
                    <p className="mt-3 text-sm font-semibold">
                      No saved addresses
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      className="mt-2 inline-block text-sm font-semibold text-primary-active hover:underline"
                    >
                      Add an address
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        role="radio"
                        aria-checked={addressId === address.id}
                        tabIndex={0}
                        onClick={() => setAddressId(address.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setAddressId(address.id);
                          }
                        }}
                        className={`cursor-pointer rounded-xl border-2 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal ${addressId === address.id ? "border-primary-normal bg-primary-normal/5" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{address.label}</span>
                          <Checkbox
                            checked={addressId === address.id}
                            aria-label={`Choose ${address.label}`}
                            tabIndex={-1}
                          />
                        </span>
                        <span className="mt-3 block text-sm font-medium">
                          {address.recipient_first_name}{" "}
                          {address.recipient_last_name}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          {address.address_line1}
                          {address.address_line2
                            ? `, ${address.address_line2}`
                            : ""}
                          <br />
                          {address.city}, {address.state} {address.zip_code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!addressId}
                    className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && method === "DELIVERY" && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <h2 className="font-title text-2xl font-semibold">
                  Delivery details
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Choose a time and tell us how to hand off your order.
                </p>
                <div className="mt-7">
                  <label className="mb-2 block text-sm font-semibold">
                    Delivery date
                  </label>
                  <DateOptionPicker value={deliveryDate} onChange={changeDeliveryDate} />
                </div>
                <div className="mt-5">
                  <label className="mb-1 block text-sm font-semibold">
                    Delivery time
                  </label>
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-900 border border-amber-200/80">
                    <Icon icon="solar:info-circle-linear" className="size-4 shrink-0 text-amber-600" />
                    <span><strong>Note:</strong> All delivery times are local to our store in Baltimore.</span>
                  </div>
                  {isLoadingDeliverySlots ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-16" />
                      ))}
                    </div>
                  ) : deliverySlots.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      No delivery slots are available on this date — try
                      another day.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {deliverySlots.map((slot) => {
                        const isPast = isSlotPastForToday(slot.start_time, isDeliveryToday);
                        const bookable = !isPast && slot.is_available && slot.remaining > 0;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!bookable}
                            onClick={() => setDeliverySlotId(slot.id)}
                            className={cn(
                              "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition",
                              deliverySlotId === slot.id
                                ? "border-primary-normal bg-primary-normal/5"
                                : "border-gray-200 hover:border-gray-300",
                              !bookable && "cursor-not-allowed opacity-40 hover:border-gray-200",
                            )}
                          >
                            <span className="text-sm font-semibold">
                              {formatStoreTime(slot.start_time)} –{" "}
                              {formatStoreTime(slot.end_time)}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {isPast
                                ? "Past"
                                : bookable
                                  ? `${slot.remaining} left`
                                  : "Full"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <label
                    htmlFor="handoff-instructions"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Handoff instructions{" "}
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    id="handoff-instructions"
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    maxLength={500}
                    placeholder="Apartment, buzzer, or other helpful directions"
                    className="min-h-28 resize-none rounded-lg"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">
                    {instructions.length}/500
                  </p>
                </div>
                <div className="mt-8 flex justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="h-12"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={continueToPreview}
                    disabled={!deliverySlotId || isPreviewing}
                    className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover"
                  >
                    {isPreviewing && (
                      <Icon icon="svg-spinners:180-ring" className="size-4" />
                    )}
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl rounded-lg p-10">
          <DialogHeader>
            <DialogTitle>Delivery addresses</DialogTitle>
            <DialogDescription>
              Add a new address or edit an existing one — it&apos;ll be ready
              to pick as soon as you close this.
            </DialogDescription>
          </DialogHeader>

          <AddressSection />
        </DialogContent>
      </Dialog>
    </>
  );
}
