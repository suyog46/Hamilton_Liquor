"use client";

import { Icon } from "@iconify/react";
import { cn, formatFullOperatingHours, siteConfig } from "@/lib/utils";
import {
  useGetPublicOperatingHoursQuery,
  useGetPublicStoreInformationQuery,
  useGetPublicStoreLocationQuery,
} from "@/redux/features/store/storeApiSlice";

interface StoreInfoCardProps {
  className?: string;
  note?: string;
}

// Shared "visit us" details card — same store info (address, hours, phone,
// email, directions) rendered on the homepage (GoogleMapSection) and the
// /contact page, both backed by the live store API instead of duplicated,
// hardcoded copies.
const StoreInfoCard = ({ className, note }: StoreInfoCardProps) => {
  const { data: informationData } = useGetPublicStoreInformationQuery();
  const { data: locationData } = useGetPublicStoreLocationQuery();
  const { data: hoursData } = useGetPublicOperatingHoursQuery();

  const information = informationData?.data;
  const location = locationData?.data;
  const address = location
    ? `${location.address}, ${location.city}, ${location.state} ${location.zip_code}`
    : siteConfig.address.full;
  const phone = information?.primary_phone || siteConfig.phone;
  const phoneHref = phone.replace(/[^\d+]/g, "") || siteConfig.phoneHref;
  const email = information?.email || siteConfig.email;
  const mapsUrl = location?.google_maps_url || siteConfig.mapsDirectionsUrl;
  const hours = hoursData?.data.hours?.length
    ? formatFullOperatingHours(hoursData.data.hours)
    : siteConfig.hours.map((entry) => ({
        day: entry.day.slice(0, 3),
        time: entry.time,
      }));

  return (
    <div
      className={cn(
        "flex flex-col gap-5 p-6 sm:p-8 rounded-2xl bg-black",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          icon="solar:map-point-linear"
          className="w-5 h-5 text-primary-normal shrink-0 mt-0.5"
        />
        <div>
          <p className="text-sm font-semibold text-white">
            {siteConfig.name}
          </p>
          <p className="text-sm text-white/60">{address}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Icon
          icon="solar:clock-circle-linear"
          className="w-5 h-5 text-primary-normal shrink-0 mt-0.5"
        />
        <div className="text-sm text-white/60">
          {hours.map((entry) => (
            <p key={entry.day}>
              {entry.day}: {entry.time}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Icon
          icon="solar:phone-linear"
          className="w-5 h-5 text-primary-normal shrink-0 mt-0.5"
        />
        <a
          href={`tel:${phoneHref}`}
          className="text-sm text-white/60 hover:text-primary-normal transition-colors"
        >
          {phone}
        </a>
      </div>

      <div className="flex items-start gap-3">
        <Icon
          icon="solar:letter-linear"
          className="w-5 h-5 text-primary-normal shrink-0 mt-0.5"
        />
        <a
          href={`mailto:${email}`}
          className="text-sm text-white/60 hover:text-primary-normal transition-colors"
        >
          {email}
        </a>
      </div>

      {note && <p className="text-xs text-white/40">{note}</p>}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 transition w-full sm:w-fit"
      >
        <Icon icon="solar:routing-2-linear" className="w-4 h-4" />
        Get Directions
      </a>
    </div>
  );
};

export default StoreInfoCard;
