import React from "react";
import { Icon } from "@iconify/react";

export interface RefundPolicySection {
  id: number;
  title: string;
  intro?: string;
  bullets?: string[];
  paragraphs?: string[];
  note?: string;
}

export const refundPolicySections: RefundPolicySection[] = [
  {
    id: 1,
    title: "Eligibility for Refunds",
    intro: "Refunds are available only when all of the following conditions are met:",
    bullets: [
      "The item is unopened, unused, and in its original condition.",
      "The refund request is made within 24 hours of delivery or pickup, or by the end of the next business day, whichever applies.",
      "The customer brings the item to Hamilton Liquor Store for inspection and processing.",
      "The customer is responsible for bringing the item back to the store. Hamilton Liquor Store does not provide return pickup for refund requests.",
    ],
    note: "Opened or partially consumed bottles are not eligible for a refund under any circumstances.",
  },
  {
    id: 2,
    title: "Damaged Items",
    paragraphs: [
      "If an item is received damaged, the customer may request a refund.",
      "The damaged item must be brought to Hamilton Liquor Store within the applicable 24-hour or 1-business-day refund period. The store may inspect the item before processing the refund.",
    ],
  },
  {
    id: 3,
    title: "Incorrect Items",
    paragraphs: [
      "If you receive an item that is different from the item you ordered or purchased, you may request a refund.",
      "The incorrect item must be returned to Hamilton Liquor Store within the applicable refund period and must be unopened and in its original condition.",
    ],
  },
  {
    id: 4,
    title: "Missing Items",
    paragraphs: [
      "If an item is missing from your order, the price of the missing item will be refunded.",
      "Customers should contact Hamilton Liquor Store as soon as possible after receiving their order so that the issue can be reviewed.",
    ],
  },
  {
    id: 5,
    title: "Returns of Unopened Items",
    paragraphs: [
      "Unopened items may be eligible for a refund if they are returned to Hamilton Liquor Store within 24 hours of delivery or pickup, or within 1 business day, provided the item remains unopened and in its original condition.",
      "Customers are responsible for bringing the item to the store.",
    ],
  },
  {
    id: 6,
    title: "Opened Items",
    paragraphs: [
      "Opened bottles or containers are not eligible for refunds or returns.",
      "This includes items that have been partially consumed, opened, or otherwise used.",
    ],
  },
  {
    id: 7,
    title: "Failed Deliveries",
    paragraphs: [
      "If an alcohol delivery cannot be completed because the customer is unavailable, unable to complete the required age verification, or otherwise cannot accept the delivery, the eligible product amount may be refunded after the order is returned to the store.",
      "Delivery charges are non-refundable.",
      "Any refund is subject to applicable laws and the conditions of this Refund & Return Policy.",
    ],
  },
  {
    id: 8,
    title: "Order Cancellations",
    paragraphs: [
      "Customers may cancel an order before the delivery driver has begun traveling to the delivery location without a cancellation fee, subject to applicable conditions.",
      "If an order is canceled after the driver is already on the way, a $5 cancellation fee will apply.",
      "The cancellation fee may be deducted from any eligible refund.",
    ],
  },
  {
    id: 9,
    title: "Refund Processing",
    paragraphs: [
      "Customers requesting a refund must bring the eligible item(s) to Hamilton Liquor Store.",
      "Once the returned item has been inspected and the refund is approved, Hamilton Liquor Store will process the refund within approximately 2–3 business days.",
      "The time it takes for the refund to appear in the customer’s account may depend on the customer’s bank or payment provider.",
    ],
  },
  {
    id: 10,
    title: "How to Request a Refund",
    intro:
      "To request a refund, please contact Hamilton Liquor Store within the applicable refund period and provide:",
    bullets: [
      "Your name",
      "Order or receipt information",
      "The item(s) involved",
      "The reason for the refund",
      "Any relevant details about the order or delivery",
    ],
    paragraphs: [
      "Customers must bring the item(s) to Hamilton Liquor Store for inspection and refund processing.",
    ],
  },
  {
    id: 11,
    title: "Policy Limitations",
    paragraphs: [
      "Refunds are subject to the requirements of this policy and applicable Maryland laws and regulations governing the sale and delivery of alcoholic beverages.",
      "Hamilton Liquor Store reserves the right to review each refund request and verify the condition of the item before issuing a refund.",
      "This policy does not limit any rights that customers may have under applicable law.",
    ],
  },
];

interface RefundPolicyProps {
  /** If true, adjusts layout and spacing for modal/dialog display */
  inDialog?: boolean;
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ inDialog = false }) => {
  return (
    <div
      className={
        inDialog
          ? "space-y-6 text-gray-800"
          : "max-w-[880px] mx-auto px-6 py-12 sm:py-16 space-y-8 text-gray-800"
      }
    >
      {/* Policy Header / Summary Card */}
      <div
        className={
          inDialog
            ? "rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5"
            : "rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <h2 className="font-title text-lg sm:text-xl font-bold text-gray-900">
              Hamilton Liquor Store
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Icon icon="solar:map-point-bold" className="text-primary-normal size-4" />
              <span>Location: Maryland</span>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary-normal/15 px-3 py-1 text-xs font-semibold text-gray-900">
            Official Store Policy
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
          At Hamilton Liquor Store, we want our customers to have a positive
          shopping experience. If there is an issue with your purchase, we may
          provide a refund in accordance with the policy below.
        </p>
      </div>

      {/* Sections List */}
      <div className={inDialog ? "space-y-5" : "space-y-8"}>
        {refundPolicySections.map((section) => (
          <div
            key={section.id}
            className={`rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:border-gray-200 ${
              inDialog ? "shadow-xs" : "shadow-sm"
            }`}
          >
            <div className="flex items-baseline gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-normal/20 text-xs font-bold text-gray-900">
                {section.id}
              </span>
              <h3 className="font-title text-base sm:text-lg font-bold text-gray-900">
                {section.title}
              </h3>
            </div>

            <div className="mt-3 pl-10 space-y-3">
              {section.intro && (
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {section.intro}
                </p>
              )}

              {section.bullets && (
                <ul className="list-disc space-y-1.5 pl-5 text-sm sm:text-base text-gray-600">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {section.paragraphs?.map((p, idx) => (
                <p
                  key={idx}
                  className="text-sm sm:text-base leading-relaxed text-gray-600"
                >
                  {p}
                </p>
              ))}

              {section.note && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs sm:text-sm text-red-800 flex items-start gap-2">
                  <Icon icon="solar:danger-triangle-bold" className="size-4 shrink-0 mt-0.5" />
                  <span>{section.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
        This Refund &amp; Return Policy applies to all purchases, in-store pickups, and local delivery orders fulfilled by Hamilton Liquor Store in Maryland.
      </div>
    </div>
  );
};

export default RefundPolicy;
