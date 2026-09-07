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
import { Textarea } from "@/components/ui/textarea";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import {
  useGetStoreInformationQuery,
  useUpdateStoreInformationMutation,
} from "@/redux/features/store/storeApiSlice";

const getErrorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "Unable to save store information.";
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ?? data?.message ?? "Unable to save store information."
  );
};

export default function AdminStoreInformationPage() {
  const { data, isLoading, isError, refetch } = useGetStoreInformationQuery();
  const [updateInformation, { isLoading: isSaving }] =
    useUpdateStoreInformationMutation();
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!data?.data) return;
    setPrimaryPhone(data.data.primary_phone ?? "");
    setSecondaryPhone(data.data.secondary_phone ?? "");
    setEmail(data.data.email ?? "");
    setDescription(data.data.description ?? "");
  }, [data]);

  const saveInformation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateInformation({
        primary_phone: primaryPhone.trim() || null,
        secondary_phone: secondaryPhone.trim() || null,
        email: email.trim() || null,
        description: description.trim() || null,
      }).unwrap();
      toast.success("Store information updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError) {
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="size-7 text-destructive"
          />
          <p className="text-sm font-semibold">
            Unable to load store information.
          </p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={saveInformation} className="flex flex-col gap-5">
      <AdminPageHeader
        title="Store Information"
        description="Manage the contact details shown across the storefront."
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
          <CardTitle>Contact details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="primary-phone">Primary phone</Label>
            <Input
              id="primary-phone"
              value={primaryPhone}
              onChange={(event) => setPrimaryPhone(event.target.value)}
              placeholder="(443) 438-5483"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="secondary-phone">Secondary phone</Label>
            <Input
              id="secondary-phone"
              value={secondaryPhone}
              onChange={(event) => setSecondaryPhone(event.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="store-email">Email address</Label>
            <Input
              id="store-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="store@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="store-description">Description</Label>
            <Textarea
              id="store-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Tell customers about your store."
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
