import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import { siteConfig } from "@/lib/utils";

const highlights = [
  {
    icon: "solar:bottle-linear",
    title: "Curated Selection",
    description: "Wine, spirits, beer, and mixers hand-picked by staff who know the shelves inside and out.",
  },
  {
    icon: "solar:users-group-rounded-linear",
    title: "Knowledgeable Staff",
    description: "Ask us for a pairing, a gift recommendation, or a new bottle to try — we're happy to help.",
  },
  {
    icon: "solar:bag-check-outline",
    title: "Fast Pickup",
    description: "Order online and pick up in-store, usually ready within 30–60 minutes.",
  },
  {
    icon: "solar:map-point-linear",
    title: "Proud Local Shop",
    description: "Serving the Hamilton neighborhood on Harford Road for the Baltimore community.",
  },
];

const AboutPage = () => {
  return (
    <>
      <PageBanner
        eyebrow="Our Story"
        title="About Hamilton Liquor Store"
        subtitle="A trusted neighborhood liquor store on Harford Road, serving Baltimore with a carefully curated selection and friendly, knowledgeable service."
        breadcrumbs={[{ name: "About Us" }]}
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative h-72 sm:h-96 lg:h-[26rem] rounded-2xl overflow-hidden bg-gray-100 order-1 lg:order-none">
            <Image src="/Home/about.jpg" alt="Inside Hamilton Liquor Store" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>

          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Who We Are</span>
            <h2 className="font-title text-2xl sm:text-3xl font-bold text-black leading-tight">
              Your Neighborhood Bottle Shop on Harford Road
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {siteConfig.name} has been part of the Hamilton neighborhood, stocking shelves with everything from
              everyday favorites to hard-to-find bottles. We built our online store to make browsing, ordering, and
              picking up your favorites as easy as walking down the aisle.
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              From weekly specials to staff picks, we take pride in helping every customer find the right bottle for
              the occasion — whether that&apos;s a weeknight six-pack or a bottle worth celebrating.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition"
              >
                Shop Now
              </Link>
              <Link
                href="/location-hours"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-black text-black text-sm font-semibold hover:bg-black hover:text-white transition"
              >
                <Icon icon="solar:routing-2-linear" className="w-4 h-4" />
                Get Directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <div key={item.title} className="flex flex-col gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black">
                  <Icon icon={item.icon} className="w-6 h-6 text-primary-normal" />
                </div>
                <h3 className="font-title text-base font-semibold text-black">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
