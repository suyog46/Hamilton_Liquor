import { Icon } from "@iconify/react";
import GlowBackground from "@/components/Common/GlowBackground/GlowBackground";

const Advertisement = () => {
  return (
    <section className="relative bg-black py-20 overflow-hidden">
      <GlowBackground />

      <div className="relative max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Limited Time</span>
          <h2 className="font-title text-3xl sm:text-4xl font-bold text-white leading-tight">
            20% Off Every Second Bottle
          </h2>
          <p className="text-white/60 max-w-md">
            Stock your cabinet for the season. Mix and match across whiskey,
            wine, and craft spirits — offer ends soon.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-normal/10 border border-primary-normal/40">
            <Icon icon="mdi:sale-outline" className="w-10 h-10 text-primary-normal" />
          </div>
          <a
            href="/specials"
            className="px-8 py-3 text-sm font-semibold rounded-lg bg-primary-normal text-black hover:opacity-90 transition"
          >
            Shop the Offer
          </a>
        </div>
      </div>
    </section>
  );
};

export default Advertisement;
