import { Icon } from "@iconify/react";
import { siteConfig } from "@/lib/utils";

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

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 bg-black">
            <div className="flex items-start gap-3">
              <Icon icon="solar:map-point-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">{siteConfig.name}</p>
                <p className="text-sm text-white/60">{siteConfig.address.full}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
              <div className="text-sm text-white/60">
                <p>Mon&ndash;Thu: 9:00am &ndash; 10:00pm</p>
                <p>Fri&ndash;Sat: 9:00am &ndash; 11:00pm</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="solar:phone-linear" className="w-5 h-5 text-primary-normal shrink-0 mt-0.5" />
              <a href={siteConfig.phoneHref} className="text-sm text-white/60 hover:text-primary-normal transition-colors">
                {siteConfig.phone}
              </a>
            </div>
            <a
              href={siteConfig.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition w-full sm:w-fit"
            >
              <Icon icon="solar:routing-2-linear" className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleMapSection;
