import type { SocialPlatform } from "@/redux/features/store/storeApiSlice";

export interface SocialPlatformMeta {
  value: SocialPlatform;
  label: string;
  icon: string;
}

// Single source of truth for the 4 platforms the API accepts — shared by the
// admin social links form and the storefront footer so both always agree on
// label/icon/order.
export const socialPlatforms: SocialPlatformMeta[] = [
  { value: "FACEBOOK", label: "Facebook", icon: "mdi:facebook" },
  { value: "INSTAGRAM", label: "Instagram", icon: "mdi:instagram" },
  { value: "TIKTOK", label: "TikTok", icon: "ic:baseline-tiktok" },
  { value: "X", label: "X (Twitter)", icon: "ri:twitter-x-fill" },
];

export const socialPlatformMap: Record<SocialPlatform, SocialPlatformMeta> =
  Object.fromEntries(
    socialPlatforms.map((platform) => [platform.value, platform]),
  ) as Record<SocialPlatform, SocialPlatformMeta>;
