import { Icon } from "@iconify/react";
import { siteConfig } from "@/lib/utils";

const TopBar = () => {
  return (
    <div className="hidden sm:flex fixed top-0 left-0 z-40 w-full h-9 items-center bg-black text-white/70 text-xs border-b border-white/10">
      <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <a href={siteConfig.phoneHref} className="flex items-center gap-1.5 hover:text-primary-normal transition-colors">
            <Icon icon="solar:phone-linear" className="w-3.5 h-3.5" />
            {siteConfig.phone}
          </a>
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:map-point-linear" className="w-3.5 h-3.5" />
            {siteConfig.address.full}
          </span>
          <a
            href={siteConfig.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary-normal transition-colors"
          >
            <Icon icon="solar:routing-2-linear" className="w-3.5 h-3.5" />
            Get Directions
          </a>
        </div>
        <span className="flex items-center gap-1.5">
          <Icon icon="solar:clock-circle-linear" className="w-3.5 h-3.5" />
          Mon&ndash;Thu: 9am&ndash;10pm &middot; Fri&ndash;Sat: 9am&ndash;11pm &middot; Sun: Closed
        </span>
      </div>
    </div>
  );
};

export default TopBar;
