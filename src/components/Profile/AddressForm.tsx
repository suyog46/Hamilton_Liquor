"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  type Address,
  type AddressInput,
  useCreateAddressMutation,
  useLazyGetAddressDetailQuery,
  useUpdateAddressMutation,
} from "@/redux/features/address/addressApiSlice";

// Leaflet touches `window` on import — load it client-side only.
const AddressLocationMap = dynamic(() => import("./AddressLocationMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const blankAddress = (): AddressInput => ({
  recipient_first_name: "",
  recipient_last_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  zip_code: "",
  latitude: 0,
  longitude: 0,
  label: "",
  is_default: false,
});

const toInput = (address: Address): AddressInput => ({
  recipient_first_name: address.recipient_first_name,
  recipient_last_name: address.recipient_last_name,
  address_line1: address.address_line1,
  address_line2: address.address_line2 ?? "",
  city: address.city,
  state: address.state,
  zip_code: address.zip_code,
  latitude: Number(address.latitude) || 0,
  longitude: Number(address.longitude) || 0,
  label: address.label,
  is_default: address.is_default,
});

const requiredFields: Array<keyof AddressInput> = [
  "recipient_first_name",
  "recipient_last_name",
  "address_line1",
  "city",
  "state",
  "zip_code",
  "label",
];

const detailFields: Array<[keyof AddressInput, string]> = [
  ["recipient_first_name", "First name"],
  ["recipient_last_name", "Last name"],
  ["address_line1", "Address line 1"],
  ["address_line2", "Address line 2 (optional)"],
  ["city", "City"],
  ["state", "State"],
  ["zip_code", "ZIP code"],
  ["label", "Label (Home, Work, etc.)"],
];

interface AddressApiErrorData {
  error?: {
    message?: string;
    details?: Array<{ field?: string; message?: string }>;
  };
}

const getAddressErrorMessage = (error: unknown, fallback: string) => {
  if (!isFetchBaseQueryError(error)) return fallback;

  const data = error.data as AddressApiErrorData | undefined;
  const message = data?.error?.message;
  const details = data?.error?.details
    ?.filter((detail) => detail.message)
    .map((detail) => (detail.field ? `${detail.field}: ${detail.message}` : detail.message))
    .join(" · ");

  if (message && details) return `${message} ${details}`;
  return details || message || fallback;
};

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface NominatimReverseAddress {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
}

export default function AddressForm({ open, onOpenChange, address }: AddressFormProps) {
  const editingId = address?.id ?? null;
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<AddressInput>(blankAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressInput, string>>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery.trim(), 500);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [getDetail, { isFetching: isLoadingDetail }] = useLazyGetAddressDetailQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setErrors({});
    setSearchQuery("");
    setSearchResults([]);

    if (address) {
      setForm(toInput(address));
      getDetail(address.id)
        .unwrap()
        .then((detail) => setForm(toInput(detail.data)))
        .catch(() => toast.error("Failed to load the address details."));
    } else {
      setForm(blankAddress());
    }
  }, [open, address, getDetail]);

  useEffect(() => {
    if (debouncedSearchQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(debouncedSearchQuery)}`,
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((results: NominatimResult[]) => {
        if (!cancelled) setSearchResults(results);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery]);

  const patch = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };


  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      );
      if (!res.ok) return;
      const data: { address?: NominatimReverseAddress } = await res.json();
      console.log("Reverse geocode result:", data);
      const addr = data.address ?? {};
      const line1 = [addr.house_number, addr.road].filter(Boolean).join(" ");
      const city = addr.city || addr.town || addr.village || addr.county || "";

      setForm((current) => ({
        ...current,
        address_line1: line1 || current.address_line1,
        city: city || current.city,
        state: addr.state || current.state,
        zip_code: addr.postcode || current.zip_code,
      }));
    } catch {
      console.error("Error in reverse geocoding");
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const applyLocation = (lat: number, lng: number) => {
    patch("latitude", lat);
    patch("longitude", lng);
    reverseGeocode(lat, lng);
  };

  const pickSearchResult = (result: NominatimResult) => {
    applyLocation(Number(result.lat), Number(result.lon));
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const hasLocation = form.latitude !== 0 || form.longitude !== 0;

  const goToDetails = () => {
    if (!hasLocation) {
      toast.error("Pick a location on the map first.");
      return;
    }
    setStep(2);
  };

  const save = async () => {
    const nextErrors: Partial<Record<keyof AddressInput, string>> = {};
    requiredFields.forEach((field) => {
      if (typeof form[field] === "string" && !form[field].trim()) nextErrors[field] = "Required";
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    ) as unknown as AddressInput;

    try {
      if (editingId) {
        await updateAddress({ address_id: editingId, ...body }).unwrap();
        toast.success("Address updated.");
      } else {
        await createAddress(body).unwrap();
        toast.success("Address added.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getAddressErrorMessage(
          error,
          `Failed to ${editingId ? "update" : "add"} the address.`,
        ),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl p-10 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit address" : "Add address"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Pin the exact delivery location on the map."
              : "Verify the recipient and delivery details."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className={step === 1 ? "text-primary-active" : undefined}>1. Location</span>
          <span className="h-px flex-1 bg-gray-200" />
          <span className={step === 2 ? "text-primary-active" : undefined}>2. Details</span>
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-3 py-2">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for an address…"
                className="pl-9"
              />
              {isSearching && (
                <Icon
                  icon="svg-spinners:180-ring"
                  className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
              )}
              {searchResults.length > 0 && (
                <div className="absolute z-[999999] mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => pickSearchResult(result)}
                      className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-72 overflow-hidden rounded-xl border border-gray-200 sm:h-80">
              <AddressLocationMap
                latitude={hasLocation ? form.latitude : null}
                longitude={hasLocation ? form.longitude : null}
                onChange={applyLocation}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {hasLocation
                ? `Selected: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                : "Search above, click the map, or drag the pin to set the delivery location."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {isReverseGeocoding
                ? "Looking up the address for that location…"
                : "We've filled in what we found from the map — please double-check it before saving."}
            </p>
            {detailFields.map(([key, label]) => (
              <Field
                key={key}
                data-invalid={!!errors[key]}
                className={key.startsWith("address_line") ? "sm:col-span-2" : undefined}
              >
                <FieldLabel htmlFor={`address-${key}`}>{label}</FieldLabel>
                <Input
                  id={`address-${key}`}
                  value={String(form[key])}
                  onChange={(event) => patch(key, event.target.value)}
                  disabled={isSaving || isLoadingDetail}
                />
                {errors[key] && <p className="text-[11px] text-destructive">{errors[key]}</p>}
              </Field>
            ))}
            <Field orientation="horizontal" className="sm:col-span-2">
              <Checkbox
                id="address-default"
                checked={form.is_default}
                onCheckedChange={(checked) => patch("is_default", checked === true)}
                disabled={isSaving || isLoadingDetail}
              />
              <FieldLabel htmlFor="address-default" className="font-normal">
                Use as my default address
              </FieldLabel>
            </Field>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {step === 2 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSaving}>
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          {step === 1 ? (
            <Button
              type="button"
              onClick={goToDetails}
              disabled={isSaving || isLoadingDetail}
              className="gap-2 bg-primary-normal text-black hover:bg-primary-hover"
            >
              Next: Verify details
            </Button>
          ) : (
            <Button
              type="button"
              onClick={save}
              disabled={isSaving || isLoadingDetail}
              className="gap-2 bg-primary-normal text-black hover:bg-primary-hover"
            >
              {(isSaving || isLoadingDetail) && (
                <Icon icon="svg-spinners:180-ring" className="size-4" />
              )}
              {editingId ? "Save changes" : "Add address"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




// response 
// {
//   "address": {
//     "ISO3166-2-lvl4": "GB-ENG",
//     "ISO3166-2-lvl6": "GB-KEN",
//     "building": "4 Elizabeth Court",
//     "city": "Thanet",
//     "country": "United Kingdom",
//     "country_code": "gb",
//     "county": "Kent",
//     "house_number": "4",
//     "postcode": "CT10 3NJ",
//     "road": "North Foreland Road",
//     "state": "England",
//     "suburb": "Kingsgate",
//     "town": "Broadstairs"
//   },
//   "addresstype": "building",
//   "boundingbox": [
//     "51.3693503",
//     "51.3695486",
//     "1.4436234",
//     "1.4440297"
//   ],
//   "class": "building",
//   "display_name": "4 Elizabeth Court, 4, North Foreland Road, Kingsgate, Broadstairs and St Peters, Broadstairs, Thanet, Kent, England, CT10 3NJ, United Kingdom",
//   "importance": 0.00005218051422899241,
//   "lat": "51.3694495",
//   "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
//   "lon": "1.4438266",
//   "name": "4 Elizabeth Court",
//   "osm_id": 277776776,
//   "osm_type": "way",
//   "place_id": 100975894,
//   "place_rank": 30,
//   "type": "apartments"
// }