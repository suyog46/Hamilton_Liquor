import { core } from "./core";
import type { ApiResponse } from "@/redux/types/api";
import type {
  StoreInformation,
  StoreLocation,
  OperatingHour,
  SocialLink,
} from "@/redux/features/store/storeApiSlice";

export async function getStoreInformation(): Promise<StoreInformation | null> {
  try {
    const res = await core("store/information");
    if (!res.ok) return null;
    const json: ApiResponse<StoreInformation> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getStoreLocation(): Promise<StoreLocation | null> {
  try {
    const res = await core("store/location");
    if (!res.ok) return null;
    const json: ApiResponse<StoreLocation> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getOperatingHours(): Promise<OperatingHour[]> {
  try {
    const res = await core("store/operating-hours");
    if (!res.ok) return [];
    const json: ApiResponse<{ hours: OperatingHour[] }> = await res.json();
    return json.data?.hours ?? [];
  } catch {
    return [];
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const res = await core("store/social-links");
    if (!res.ok) return [];
    const json: ApiResponse<SocialLink[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function getStoreData() {
  const [information, location, hours, socialLinks] = await Promise.all([
    getStoreInformation(),
    getStoreLocation(),
    getOperatingHours(),
    getSocialLinks(),
  ]);

  return { information, location, hours, socialLinks };
}
