import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
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

          <div className="flex flex-col gap-6 p-6 sm:p-8 bg-black">
            <div className="flex items-start gap-3">
              <Icon icon="solar:map-point-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">{siteConfig.name}</p>
                <p className="text-sm text-white/60">{siteConfig.address.full}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon icon="solar:phone-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
              <a href={siteConfig.phoneHref} className="text-sm text-white/60 hover:text-primary-normal transition-colors">
                {siteConfig.phone}
              </a>
            </div>

            <div className="flex items-start gap-3">
              <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-sm text-white/60 w-full">
                {siteConfig.hours.map((entry) => (
                  <div key={entry.day} className="flex items-center justify-between gap-4 max-w-xs">
                    <span>{entry.day}</span>
                    <span>{entry.time}</span>
                  </div>
                ))}
                <p className="text-xs text-white/40 mt-2">{siteConfig.holidayNote}</p>
              </div>
            </div>

            <a
              href={siteConfig.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition w-full sm:w-fit"
            >
              <Icon icon="solar:routing-2-linear" className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black">
              <Icon icon="solar:bag-check-outline" className="w-7 h-7 text-primary-normal" />
            </div>
            <h3 className="font-title text-xl font-semibold text-black">In-Store Pickup</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Order online and pick up in as little as 30 minutes. A valid government-issued photo ID is required —
              you must be 21 or older to complete pickup.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black">
              <Icon icon="solar:delivery-outline" className="w-7 h-7 text-primary-normal" />
            </div>
            <h3 className="font-title text-xl font-semibold text-black">Local Delivery</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Delivery to nearby zip codes where legally available. Age and ID verification is required at the door
              — see our{" "}
              <a href="/pickup-delivery-policy" className="text-primary-normal font-semibold hover:opacity-80">
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
