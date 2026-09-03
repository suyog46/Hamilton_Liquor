"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { siteConfig } from "@/lib/utils/siteConfig";
import { formatPrice, formatVolume } from "@/lib/utils/productDisplay";
import { useGetAddressesQuery } from "@/redux/features/address/addressApiSlice";
import { useGetCartQuery } from "@/redux/features/cart/cartApiSlice";
import {
  type FulfillmentMethod,
  useCheckoutMutation,
} from "@/redux/features/order/orderApiSlice";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";

interface TimeSlot {
  value: string;
  label: string;
  start: string;
  end: string;
}

const buildTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const earliest = new Date(now.getTime() + 60 * 60 * 1000);

  for (let dayOffset = 0; dayOffset < 8; dayOffset += 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + dayOffset);
    if (day.getDay() === 0) continue;

    const closingHour = day.getDay() === 5 || day.getDay() === 6 ? 23 : 22;
    for (let hour = 9; hour < closingHour; hour += 1) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      if (start < earliest) continue;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const label = `${start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}, ${start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })} – ${end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
      slots.push({ value: start.toISOString(), label, start: start.toISOString(), end: end.toISOString() });
    }
  }

  return slots;
};

const checkoutErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "We couldn't start checkout. Please try again.";
  const data = error.data as { error?: { message?: string; details?: Array<{ message?: string }> } } | undefined;
  return data?.error?.details?.find((detail) => detail.message)?.message
    ?? data?.error?.message
    ?? "We couldn't start checkout. Please try again.";
};

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState<FulfillmentMethod>("PICKUP");
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [instructions, setInstructions] = useState("");

  const { data: meData, isLoading: isLoadingUser, isError: isUserError } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data: cartData, isLoading: isLoadingCart } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const { data: addressData, isLoading: isLoadingAddresses } = useGetAddressesQuery(
    { page: 1, limit: 100 },
    { skip: !isLoggedIn },
  );
  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation();
  const timeSlots = useMemo(buildTimeSlots, []);
  const cart = cartData?.data;
  const addresses = addressData?.data.items ?? [];
  const selectedSlot = timeSlots.find((slot) => slot.value === timeValue);
  const subtotal = (cart?.items ?? []).reduce(
    (sum, item) => sum + Number(item.product_variant.price) * item.quantity,
    0,
  );

  useEffect(() => {
    if (!isLoadingUser && (isUserError || !meData?.data)) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isLoadingUser, isUserError, meData, router]);

  useEffect(() => {
    if (!addressId && addresses.length > 0) {
      setAddressId(addresses.find((address) => address.is_default)?.id ?? addresses[0].id);
    }
  }, [addressId, addresses]);

  const selectMethod = (nextMethod: FulfillmentMethod) => {
    setMethod(nextMethod);
    setStep(1);
    setTimeValue("");
  };

  const submitCheckout = async () => {
    if (!cart?.items.length || !selectedSlot) {
      toast.error(!selectedSlot ? "Choose an available time." : "Your cart is empty.");
      return;
    }
    if (method === "DELIVERY" && !addressId) {
      toast.error("Choose a delivery address.");
      setStep(2);
      return;
    }

    try {
      const schedule = method === "PICKUP"
        ? {
            pickup_scheduled_start_at: selectedSlot.start,
            pickup_scheduled_end_at: selectedSlot.end,
          }
        : {
            delivery_scheduled_start_at: selectedSlot.start,
            delivery_scheduled_end_at: selectedSlot.end,
          };
      const response = await checkout({
        items: cart.items.map((item) => ({
          product_variant_id: item.product_variant.id,
          quantity: item.quantity,
        })),
        fulfillment_method: method,
        ...(method === "DELIVERY" && {
          address_id: addressId,
          handoff_instructions: instructions.trim(),
        }),
        ...schedule,
      }).unwrap();

      if (!response.data.checkout_url) throw new Error("Missing checkout URL");
      window.location.assign(response.data.checkout_url);
    } catch (error) {
      toast.error(checkoutErrorMessage(error));
    }
  };

  if (isLoadingUser || (isLoggedIn && isLoadingCart)) {
    return <div className="mx-auto max-w-6xl px-6 py-32"><Skeleton className="h-[560px] rounded-2xl" /></div>;
  }

  if (!isLoggedIn) return null;

  if (!cart?.items.length) {
    return (
      <>
        <PageBanner eyebrow="Secure checkout" title="Checkout" breadcrumbs={[{ name: "Checkout" }]} />
        <section className="px-6 py-24 text-center">
          <Icon icon="solar:cart-large-minimalistic-linear" className="mx-auto size-12 text-gray-300" />
          <h2 className="mt-4 font-title text-2xl font-semibold">Your cart is empty</h2>
          <Link href="/shop" className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary-normal px-6 text-sm font-semibold text-black hover:bg-primary-hover">
            Continue shopping
          </Link>
        </section>
      </>
    );
  }

  const totalSteps = method === "PICKUP" ? 1 : 3;

  return (
    <>
      <PageBanner eyebrow="Secure checkout" title="Checkout" breadcrumbs={[{ name: "Cart", href: "/cart" }, { name: "Checkout" }]} />
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold">Step {step} of {totalSteps}</p>
              <p className="text-xs text-gray-500">Valid photo ID required at handoff</p>
            </div>
            <div className="mb-8 flex gap-2" aria-hidden="true">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className={`h-1.5 flex-1 rounded-full ${index < step ? "bg-primary-normal" : "bg-gray-200"}`} />
              ))}
            </div>

            {step === 1 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <h2 className="font-title text-2xl font-semibold">How would you like your order?</h2>
                <p className="mt-2 text-sm text-gray-500">Choose pickup or local delivery.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {([
                    { value: "PICKUP" as const, title: "Store pickup", description: `Pick up at ${siteConfig.address.full}`, icon: "solar:bag-check-outline" },
                    { value: "DELIVERY" as const, title: "Delivery", description: "Delivered to one of your saved addresses", icon: "solar:delivery-outline" },
                  ]).map((option) => (
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
                        <Icon icon={option.icon} className="size-8 text-primary-normal" />
                        <Checkbox checked={method === option.value} aria-label={`Choose ${option.title}`} tabIndex={-1} />
                      </span>
                      <span className="mt-5 font-semibold">{option.title}</span>
                      <span className="mt-1 text-xs leading-5 text-gray-500">{option.description}</span>
                    </div>
                  ))}
                </div>

                {method === "PICKUP" && (
                  <div className="mt-7">
                    <label className="mb-2 block text-sm font-semibold">Pickup time</label>
                    <Select value={timeValue || null} onValueChange={(value) => setTimeValue(value ?? "")}>
                      <SelectTrigger className="h-12 w-full rounded-lg border-gray-200 px-4 text-sm">
                        <SelectValue placeholder="Choose an available pickup time" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {timeSlots.map((slot) => <SelectItem key={slot.value} value={slot.value} className="py-3">{slot.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  {method === "DELIVERY" ? (
                    <Button onClick={() => setStep(2)} className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover">Continue to address</Button>
                  ) : (
                    <Button onClick={submitCheckout} disabled={!timeValue || isCheckingOut} className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover">
                      {isCheckingOut && <Icon icon="svg-spinners:180-ring" className="size-4" />}
                      Continue to payment
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === 2 && method === "DELIVERY" && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <h2 className="font-title text-2xl font-semibold">Choose a delivery address</h2>
                <p className="mt-2 text-sm text-gray-500">Select from your saved addresses.</p>
                {isLoadingAddresses ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
                ) : addresses.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
                    <Icon icon="solar:map-point-linear" className="mx-auto size-9 text-gray-300" />
                    <p className="mt-3 text-sm font-semibold">No saved addresses</p>
                    <Link href="/my-profile" className="mt-2 inline-block text-sm font-semibold text-primary-active">Add an address in your profile</Link>
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
                          <Checkbox checked={addressId === address.id} aria-label={`Choose ${address.label}`} tabIndex={-1} />
                        </span>
                        <span className="mt-3 block text-sm font-medium">{address.recipient_first_name} {address.recipient_last_name}</span>
                        <span className="mt-1 block text-xs leading-5 text-gray-500">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}<br />{address.city}, {address.state} {address.zip_code}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12">Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!addressId} className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover">Continue</Button>
                </div>
              </div>
            )}

            {step === 3 && method === "DELIVERY" && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <h2 className="font-title text-2xl font-semibold">Delivery details</h2>
                <p className="mt-2 text-sm text-gray-500">Choose a time and tell us how to hand off your order.</p>
                <div className="mt-7">
                  <label className="mb-2 block text-sm font-semibold">Delivery time</label>
                  <Select value={timeValue || null} onValueChange={(value) => setTimeValue(value ?? "")}>
                    <SelectTrigger className="h-12 w-full rounded-lg border-gray-200 px-4 text-sm"><SelectValue placeholder="Choose an available delivery time" /></SelectTrigger>
                    <SelectContent className="rounded-lg">{timeSlots.map((slot) => <SelectItem key={slot.value} value={slot.value} className="py-3">{slot.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="mt-6">
                  <label htmlFor="handoff-instructions" className="mb-2 block text-sm font-semibold">Handoff instructions <span className="font-normal text-gray-400">(optional)</span></label>
                  <Textarea id="handoff-instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={500} placeholder="Apartment, buzzer, or other helpful directions" className="min-h-28 resize-none rounded-lg" />
                  <p className="mt-1 text-right text-xs text-gray-400">{instructions.length}/500</p>
                </div>
                <div className="mt-8 flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12">Back</Button>
                  <Button onClick={submitCheckout} disabled={!timeValue || isCheckingOut} className="h-12 bg-primary-normal px-8 text-black hover:bg-primary-hover">
                    {isCheckingOut && <Icon icon="svg-spinners:180-ring" className="size-4" />}
                    Continue to payment
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 lg:sticky lg:top-28 sm:p-6">
            <h2 className="font-title text-xl font-semibold">Order summary</h2>
            <div className="mt-5 divide-y divide-gray-100">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-4 first:pt-0">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {item.product_variant.thumbnail?.url ? <img src={item.product_variant.thumbnail.url} alt={item.product_variant.product.name} className="h-full w-full object-cover" /> : <Icon icon="solar:bottle-linear" className="absolute inset-0 m-auto size-7 text-gray-300" />}
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{item.product_variant.product.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatVolume(item.product_variant.volume_ml)}</p>
                    <p className="mt-2 text-sm font-bold">{formatPrice(Number(item.product_variant.price) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
              <p className="mt-3 text-xs leading-5 text-gray-500">Delivery fees, if applicable, are calculated by the checkout service before payment.</p>
            </div>
            <div className="mt-5 flex gap-2 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
              <Icon icon="solar:shield-check-linear" className="mt-0.5 size-4 shrink-0 text-primary-active" />
              You must be 21+ and present a valid government-issued photo ID at pickup or delivery.
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
