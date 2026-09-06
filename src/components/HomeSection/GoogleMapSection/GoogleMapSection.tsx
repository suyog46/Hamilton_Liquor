import { siteConfig } from "@/lib/utils";
import StoreInfoCard from "@/components/Common/StoreInfoCard/StoreInfoCard";

const GoogleMapSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Find Us</span>
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">Visit the Store</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="relative h-64 sm:h-80 lg:h-full min-h-64 bg-gray-100">
            <iframe
              title={`${siteConfig.name} on Google Maps`}
              src={siteConfig.mapsEmbedUrl}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <StoreInfoCard className="rounded-none justify-center" />
        </div>
      </div>
    </section>
  );
};

export default GoogleMapSection;
