"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { cn, formatStoreTime } from "@/lib/utils";
import {
  type DayOfWeek,
  type DeliverySlot,
  useCreateDeliverySlotMutation,
  useDeleteDeliverySlotMutation,
  useGetAdminDeliverySlotsQuery,
  useUpdateDeliverySlotMutation,
} from "@/redux/features/store/storeApiSlice";

const days: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const DEFAULT_LIMIT = 10;

const toInputTime = (value: string) => value.slice(0, 5);
const toApiTime = (value: string) => `${value || "00:00"}:00`;
const blankForm = () => ({
  start_time: "09:00",
  end_time: "11:00",
  capacity: "1",
  is_active: true,
});

const errorMessage = (error: unknown, fallback: string) => {
  if (!isFetchBaseQueryError(error)) return fallback;
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return data?.error?.message ?? data?.message ?? fallback;
};

export default function AdminDeliverySlotsPage() {
  const [activeDay, setActiveDay] = useState<DayOfWeek>("MONDAY");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(blankForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(blankForm);

  const [deleteTarget, setDeleteTarget] = useState<DeliverySlot | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminDeliverySlotsQuery({
    day_of_week: activeDay,
    page,
    limit,
  });
  const [createSlot, { isLoading: isCreating }] = useCreateDeliverySlotMutation();
  const [updateSlot, { isLoading: isSaving }] = useUpdateDeliverySlotMutation();
  const [deleteSlot, { isLoading: isDeleting }] = useDeleteDeliverySlotMutation();

  const slots = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  const changeDay = (day: DayOfWeek) => {
    setActiveDay(day);
    setPage(1);
    setEditingId(null);
  };

  const openAdd = () => {
    setAddForm(blankForm());
    setAddOpen(true);
  };

  const submitAdd = async () => {
    if (addForm.end_time <= addForm.start_time) {
      toast.error("End time must be after the start time.");
      return;
    }
    try {
      await createSlot({
        day_of_week: activeDay,
        start_time: toApiTime(addForm.start_time),
        end_time: toApiTime(addForm.end_time),
        capacity: Math.max(1, Number(addForm.capacity) || 1),
        is_active: addForm.is_active,
      }).unwrap();
      toast.success("Slot added.");
      setAddOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add the slot."));
    }
  };

  const startEdit = (slot: DeliverySlot) => {
    setEditingId(slot.id);
    setEditForm({
      start_time: toInputTime(slot.start_time),
      end_time: toInputTime(slot.end_time),
      capacity: String(slot.capacity),
      is_active: slot.is_active,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (editForm.end_time <= editForm.start_time) {
      toast.error("End time must be after the start time.");
      return;
    }
    try {
      await updateSlot({
        slot_id: editingId,
        day_of_week: activeDay,
        start_time: toApiTime(editForm.start_time),
        end_time: toApiTime(editForm.end_time),
        capacity: Math.max(1, Number(editForm.capacity) || 1),
        is_active: editForm.is_active,
      }).unwrap();
      toast.success("Slot updated.");
      setEditingId(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update the slot."));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSlot(deleteTarget.id).unwrap();
      toast.success("Slot removed.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to remove the slot."));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Delivery Time Slots"
        description="Set the bookable delivery windows customers can choose at checkout."
        action={
          <Button
            type="button"
            onClick={openAdd}
            className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
          >
            <Icon icon="solar:add-circle-linear" className="size-4" />
            Add slot
          </Button>
        }
      />

      <div className="flex items-center gap-2 rounded-lg bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-900 border border-amber-200/80">
        <Icon icon="solar:info-circle-linear" className="size-4 shrink-0 text-amber-600" />
        <span><strong>Note:</strong> All delivery slot times are local to our store in Baltimore.</span>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-3">
        {days.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => changeDay(day.value)}
            aria-pressed={activeDay === day.value}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeDay === day.value
                ? "bg-primary-normal text-black"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            {day.label}
          </button>
        ))}
      </div>

      {isError ? (
        <Card>
          <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
            <Icon icon="solar:danger-circle-linear" className="size-7 text-destructive" />
            <p className="text-sm font-semibold">Unable to load delivery slots.</p>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-3">
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No delivery slots on this day yet.
              </p>
            ) : (
              slots.map((slot) =>
                editingId === slot.id ? (
                  <div key={slot.id} className={cn("flex justify-between items-center gap-2.5")}>
                    <div className="flex gap-8">
                      <div className="flex gap-2">
                      
                    <Input
                      type="time"
                      aria-label="Slot start time"
                      value={editForm.start_time}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, start_time: event.target.value }))
                      }
                      disabled={isSaving}
                      className="w-40"
                    />
                    <span className="text-xs text-muted-foreground">–</span>
                    <Input
                      type="time"
                      aria-label="Slot end time"
                      value={editForm.end_time}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, end_time: event.target.value }))
                      }
                      disabled={isSaving}
                      aria-invalid={editForm.end_time <= editForm.start_time}
                      className="w-40"
                    />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon icon="solar:users-group-rounded-linear" className="size-3.5" />
                      Capacity
                    </label>
                    <Input
                      type="number"
                      min={1}
                      aria-label="Slot capacity"
                      value={editForm.capacity}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, capacity: event.target.value }))
                      }
                      disabled={isSaving}
                      className="w-20"
                    />
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={editForm.is_active}
                        onCheckedChange={(checked) =>
                          setEditForm((current) => ({ ...current, is_active: checked === true }))
                        }
                        disabled={isSaving}
                      />
                      Active
                    </label>

                    </div>
                    <div className="flex gap-3">
                    <Button
                      type="button"
                      size="sm"
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="gap-1.5 w-32 rounded-lg bg-primary-normal text-black hover:bg-primary-hover"
                    >
                      {isSaving && <Icon icon="svg-spinners:180-ring" className="size-3.5" />}
                      Update
                    </Button>
                    <button
                      type="button"
                      aria-label="Cancel editing"
                      onClick={() => setEditingId(null)}
                      disabled={isSaving}
                      className="justify-self-start text-muted-foreground transition-colors hover:text-foreground sm:justify-self-end"
                    >
                      <Icon icon="solar:close-circle-linear" className="size-4" />
                    </button>

                    </div>
                  </div>
                ) : (
                  <div
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Icon icon="solar:clock-circle-linear" className="size-4 text-primary-normal" />
                        {formatStoreTime(slot.start_time)} – {formatStoreTime(slot.end_time)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon icon="solar:users-group-rounded-linear" className="size-3.5" />
                        Capacity {slot.capacity}
                      </span>
                      <Badge variant={slot.is_active ? "success" : "outline"}>
                        {slot.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Edit slot"
                        onClick={() => startEdit(slot)}
                        className="text-muted-foreground transition-colors hover:text-primary-active"
                      >
                        <Icon icon="solar:pen-linear" className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove slot"
                        onClick={() => setDeleteTarget(slot)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Icon icon="solar:trash-bin-minimalistic-linear" className="size-4" />
                      </button>
                    </div>
                  </div>
                ),
              )
            )}
          </CardContent>
        </Card>
      )}

      {pagination && pagination.total_pages > 0 && (
        <DataTablePagination
          page={pagination.page}
          limit={pagination.limit || limit}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          disabled={isFetching}
          onPageChange={setPage}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
        />
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a delivery slot</DialogTitle>
            <DialogDescription>
              {days.find((day) => day.value === activeDay)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-slot-start">Start time</Label>
              <Input
                id="add-slot-start"
                type="time"
                value={addForm.start_time}
                onChange={(event) =>
                  setAddForm((current) => ({ ...current, start_time: event.target.value }))
                }
                disabled={isCreating}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-slot-end">End time</Label>
              <Input
                id="add-slot-end"
                type="time"
                value={addForm.end_time}
                onChange={(event) =>
                  setAddForm((current) => ({ ...current, end_time: event.target.value }))
                }
                disabled={isCreating}
                aria-invalid={addForm.end_time <= addForm.start_time}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-slot-capacity">Capacity</Label>
              <Input
                id="add-slot-capacity"
                type="number"
                min={1}
                value={addForm.capacity}
                onChange={(event) =>
                  setAddForm((current) => ({ ...current, capacity: event.target.value }))
                }
                disabled={isCreating}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="add-slot-active"
                checked={addForm.is_active}
                onCheckedChange={(checked) =>
                  setAddForm((current) => ({ ...current, is_active: checked === true }))
                }
                disabled={isCreating}
              />
              <Label htmlFor="add-slot-active" className="font-normal">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitAdd}
              disabled={isCreating}
              className="gap-1.5 bg-primary-normal text-black hover:bg-primary-hover"
            >
              {isCreating && <Icon icon="svg-spinners:180-ring" className="size-4" />}
              Add slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this delivery slot?"
        description="This cannot be undone."
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
