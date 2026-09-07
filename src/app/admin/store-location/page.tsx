"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  useGetStoreLocationQuery,
  useUpdateStoreLocationMutation,
} from "@/redux/features/store/storeApiSlice";

const getErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "Unable to save store location.";
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ?? data?.message ?? "Unable to save store location."
  );
};

const parseCoordinate = (value: string) => {
  if (!value.trim()) return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
};

export default function AdminStoreLocationPage() {
  const { data, isLoading, isError, refetch } = useGetStoreLocationQuery();
  const [updateLocation, { isLoading: isSaving }] =
    useUpdateStoreLocationMutation();
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: "",
    longitude: "",
    google_maps_url: "",
  });

  useEffect(() => {
    if (data?.data) {
      setForm({
        ...data.data,
        latitude: data.data.latitude ?? "",
        longitude: data.data.longitude ?? "",
      });
    }
  }, [data]);

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const saveLocation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateLocation({
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip_code: form.zip_code.trim(),
        latitude: parseCoordinate(form.latitude),
        longitude: parseCoordinate(form.longitude),
        google_maps_url: form.google_maps_url.trim() || undefined,
      }).unwrap();
      toast.success("Store location updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError)
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="size-7 text-destructive"
          />
          <p className="text-sm font-semibold">
            Unable to load store location.
          </p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <form onSubmit={saveLocation} className="flex flex-col gap-5">
      <AdminPageHeader
        title="Store Location"
        description="Manage the address and map details shown to customers."
        action={
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
          >
            {isSaving ? (
              <Icon icon="svg-spinners:180-ring" className="size-4" />
            ) : (
              <Icon icon="solar:diskette-linear" className="size-4" />
            )}
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Street address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={form.state}
              onChange={(event) => updateField("state", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postal-code">Postal code</Label>
            <Input
              id="postal-code"
              value={form.zip_code}
              onChange={(event) =>
                updateField("zip_code", event.target.value)
              }
            />
          </div>
          {/* <div className="flex flex-col gap-1.5">
            <Label htmlFor="maps-url">Google Maps URL</Label>
            <Input
              id="maps-url"
              type="url"
              value={form.google_maps_url}
              onChange={(event) =>
                updateField("google_maps_url", event.target.value)
              }
              placeholder="https://maps.google.com/…"
            />
          </div> */}
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader>
          <CardTitle>Coordinates</CardTitle>
          <p className="text-xs text-muted-foreground">
            Used to position the store accurately on maps.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(event) => updateField("latitude", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(event) => updateField("longitude", event.target.value)}
            />
          </div>
        </CardContent>
      </Card> */}
    </form>
  );
}
