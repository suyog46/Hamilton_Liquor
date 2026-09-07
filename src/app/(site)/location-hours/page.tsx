import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import StoreInfoCard from "@/components/Common/StoreInfoCard/StoreInfoCard";
import { siteConfig } from "@/lib/utils";

const LocationHoursPage = () => {
  return (
    <>
      <PageBanner
        eyebrow="Visit Us"
        title="Location & Hours"
        subtitle="Find us on Harford Road in Hamilton, Baltimore. Stop by, call ahead, or order online for pickup."
        breadcrumbs={[{ name: "Location & Hours" }]}
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="relative h-72 sm:h-96 lg:h-full min-h-72 bg-gray-100">
            <iframe
              title={`${siteConfig.name} on Google Maps`}
              src={siteConfig.mapsEmbedUrl}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <StoreInfoCard
            className="rounded-none justify-center"
            note={siteConfig.holidayNote}
          />
        </div>
      </section>

      <section className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black">
              <Icon
                icon="solar:bag-check-outline"
                className="w-7 h-7 text-primary-normal"
              />
            </div>
            <h3 className="font-title text-xl font-semibold text-black">
              In-Store Pickup
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Order online and pick up in as little as 30 minutes. A valid
              government-issued photo ID is required — you must be 21 or older
              to complete pickup.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black">
              <Icon
                icon="solar:delivery-outline"
                className="w-7 h-7 text-primary-normal"
              />
            </div>
            <h3 className="font-title text-xl font-semibold text-black">
              Local Delivery
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Delivery to nearby zip codes where legally available. Age and ID
              verification is required at the door — see our{" "}
              <a
                href="/pickup-delivery-policy"
                className="text-primary-normal font-semibold hover:opacity-80"
              >
                Pickup &amp; Delivery Policy
              </a>{" "}
              for full details.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default LocationHoursPage;
