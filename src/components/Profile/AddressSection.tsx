"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import AddressForm from "./AddressForm";
import {
  type Address,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
} from "@/redux/features/address/addressApiSlice";

export default function AddressSection() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  const { data, isLoading, isFetching } = useGetAddressesQuery({ page, limit });
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

  const addresses = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  const openCreate = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingAddress(address);
    setFormOpen(true);
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

      <AddressForm open={formOpen} onOpenChange={setFormOpen} address={editingAddress} />

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
