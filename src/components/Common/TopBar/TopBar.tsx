"use client";

import { Icon } from "@iconify/react";
import { formatOperatingHours, siteConfig } from "@/lib/utils";
import {
  useGetPublicOperatingHoursQuery,
  useGetPublicStoreInformationQuery,
  useGetPublicStoreLocationQuery,
} from "@/redux/features/store/storeApiSlice";

const TopBar = () => {
  const { data: informationData } = useGetPublicStoreInformationQuery();
  const { data: locationData } = useGetPublicStoreLocationQuery();
  const { data: hoursData } = useGetPublicOperatingHoursQuery();
  const phone = informationData?.data.primary_phone || siteConfig.phone;
  const address = locationData?.data
    ? `${locationData.data.address}, ${locationData.data.city}, ${locationData.data.state} ${locationData.data.postal_code}`
    : siteConfig.address.full;
  const mapsUrl =
    locationData?.data?.google_maps_url || siteConfig.mapsDirectionsUrl;
  const hoursSummary = hoursData?.data.hours?.length
    ? formatOperatingHours(hoursData.data.hours)
    : "Mon–Thu: 9am–10pm · Fri–Sat: 9am–11pm · Sun: Closed";

  return (
    <div className="hidden sm:flex fixed top-0 left-0 z-40 w-full h-9 items-center bg-black text-white/70 text-xs border-b border-white/10">
      <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-1.5 hover:text-primary-normal transition-colors"
          >
            <Icon icon="solar:phone-linear" className="w-3.5 h-3.5" />
            {phone}
          </a>
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:map-point-linear" className="w-3.5 h-3.5" />
            {address}
          </span>
          <a
            href={mapsUrl}
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
          {hoursSummary}
        </span>
      </div>
    </div>
  );
};

export default TopBar;
