"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useLazyGetAddressDetailQuery,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "@/redux/features/address/addressApiSlice";

const blankAddress = (): AddressInput => ({
  recipient_first_name: "",
  recipient_last_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  zip_code: "",
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
    .map((detail) => detail.field ? `${detail.field}: ${detail.message}` : detail.message)
    .join(" · ");

  if (message && details) return `${message} ${details}`;
  return details || message || fallback;
};

export default function AddressSection() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>(blankAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressInput, string>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const { data, isLoading, isFetching } = useGetAddressesQuery({ page, limit });
  const [getDetail, { isFetching: isLoadingDetail }] = useLazyGetAddressDetailQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

  const addresses = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const isSaving = isCreating || isUpdating;

  const patch = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(blankAddress());
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = async (address: Address) => {
    setEditingId(address.id);
    setForm(toInput(address));
    setErrors({});
    setFormOpen(true);
    try {
      const detail = await getDetail(address.id).unwrap();
      setForm(toInput(detail.data));
    } catch {
      toast.error("Failed to load the address details.");
      setFormOpen(false);
    }
  };

  const saveAddress = async () => {
    const nextErrors: Partial<Record<keyof AddressInput, string>> = {};
    requiredFields.forEach((field) => {
      if (typeof form[field] === "string" && !form[field].trim()) nextErrors[field] = "Required";
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
    ) as unknown as AddressInput;

    try {
      if (editingId) {
        await updateAddress({ address_id: editingId, ...body }).unwrap();
        toast.success("Address updated.");
      } else {
        await createAddress(body).unwrap();
        toast.success("Address added.");
      }
      setFormOpen(false);
    } catch (error) {
      toast.error(
        getAddressErrorMessage(
          error,
          `Failed to ${editingId ? "update" : "add"} the address.`,
        ),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress(deleteTarget.id).unwrap();
      toast.success("Address deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete the address.");
    }
  };

  const makeDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id).unwrap();
      toast.success("Default address updated.");
    } catch {
      toast.error("Failed to set the default address.");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-title text-xl font-semibold">Saved addresses</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your delivery addresses.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-primary-normal text-black hover:bg-primary-hover">
          <Icon icon="solar:add-circle-linear" className="size-4" />
          Add address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon icon="solar:map-point-linear" className="size-10 text-gray-300" />
            <p className="font-medium">No saved addresses yet</p>
            <p className="text-xs text-muted-foreground">Add an address for faster checkout.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? "ring-primary-normal" : undefined}>
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{address.label}</p>
                    {address.is_default && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <Icon icon="solar:map-point-linear" className="size-5 text-primary-normal" />
                </div>
                <div className="flex-1 text-sm leading-6 text-gray-600">
                  <p className="font-medium text-black">
                    {address.recipient_first_name} {address.recipient_last_name}
                  </p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.state} {address.zip_code}</p>
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(address)}>Edit</Button>
                  {!address.is_default && (
                    <Button variant="outline" size="sm" disabled={isSettingDefault} onClick={() => makeDefault(address)}>
                      Set as default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteTarget(address)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <DataTablePagination
          page={pagination.page}
          limit={pagination.limit}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          disabled={isFetching}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => { setLimit(nextLimit); setPage(1); }}
        />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add address"}</DialogTitle>
            <DialogDescription>Enter the recipient and delivery details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {([
              ["recipient_first_name", "First name"],
              ["recipient_last_name", "Last name"],
              ["address_line1", "Address line 1"],
              ["address_line2", "Address line 2 (optional)"],
              ["city", "City"],
              ["state", "State"],
              ["zip_code", "ZIP code"],
              ["label", "Label (Home, Work, etc.)"],
            ] as Array<[keyof AddressInput, string]>).map(([key, label]) => (
              <Field key={key} data-invalid={!!errors[key]} className={key.startsWith("address_line") ? "sm:col-span-2" : undefined}>
                <FieldLabel htmlFor={`address-${key}`}>{label}</FieldLabel>
                <Input id={`address-${key}`} value={String(form[key])} onChange={(event) => patch(key, event.target.value)} disabled={isSaving || isLoadingDetail} />
                {errors[key] && <p className="text-[11px] text-destructive">{errors[key]}</p>}
              </Field>
            ))}
            <Field orientation="horizontal" className="sm:col-span-2">
              <Checkbox id="address-default" checked={form.is_default} onCheckedChange={(checked) => patch("is_default", checked === true)} disabled={isSaving || isLoadingDetail} />
              <FieldLabel htmlFor="address-default" className="font-normal">Use as my default address</FieldLabel>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={saveAddress} disabled={isSaving || isLoadingDetail} className="gap-2 bg-primary-normal text-black hover:bg-primary-hover">
              {(isSaving || isLoadingDetail) && <Icon icon="svg-spinners:180-ring" className="size-4" />}
              {editingId ? "Save changes" : "Add address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this address?"
        description={deleteTarget ? `${deleteTarget.label} will be permanently removed from your saved addresses.` : undefined}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
