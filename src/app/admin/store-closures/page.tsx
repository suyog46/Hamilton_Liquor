"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { ConfirmDialog } from "@/components/Admin/ConfirmDialog/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  type StoreClosure,
  useGetStoreClosuresQuery,
  useCreateStoreClosureMutation,
  useUpdateStoreClosureMutation,
  useDeleteStoreClosureMutation,
} from "@/redux/features/store/storeApiSlice";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const toDateKey = (value: string) => value.slice(0, 10);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as { message?: string; error?: { message?: string } } | undefined;
    return data?.message ?? data?.error?.message ?? fallback;
  }
  return fallback;
};

// ─── Calendar Component ───────────────────────────────────────────────────────

function ClosureCalendar({
  year,
  month,
  closureDates,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  closureDates: Set<string>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const cells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  const today = toDateKey(new Date().toISOString());

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
          aria-label="Previous month"
        >
          <Icon icon="solar:alt-arrow-left-linear" className="h-3.5 w-3.5" />
        </button>
        <p className="text-sm font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <button
          type="button"
          onClick={onNext}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
          aria-label="Next month"
        >
          <Icon icon="solar:alt-arrow-right-linear" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="h-10 bg-white" />;

          const mm = String(month).padStart(2, "0");
          const dd = String(day).padStart(2, "0");
          const key = `${year}-${mm}-${dd}`;
          const isClosed = closureDates.has(key);
          const isToday = key === today;
          const isSelected = key === selectedDate;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={cn(
                "relative flex h-10 flex-col items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-active focus-visible:ring-inset",
                isClosed ? "bg-red-50/50" : "bg-white hover:bg-gray-50",
                isSelected && (isClosed ? "bg-red-100" : "bg-gray-100"),
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                  isClosed && !isSelected && "bg-red-500 text-white font-semibold",
                  isClosed && isSelected && "bg-red-600 text-white font-bold ring-2 ring-red-200 ring-offset-1",
                  !isClosed && isSelected && "bg-gray-800 text-white font-bold ring-2 ring-gray-200 ring-offset-1",
                  isToday && !isClosed && !isSelected && "bg-primary-normal/20 text-primary-active font-semibold",
                  !isClosed && !isToday && !isSelected && "text-gray-700",
                )}
              >
                {day}
              </span>
              {isClosed && (
                <span className={cn("mt-0.5 text-[8px] font-semibold uppercase tracking-wide leading-none", isSelected ? "text-red-600" : "text-red-400")}>
                  closed
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-[11px] text-muted-foreground">Closure day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-primary-normal/30" />
          <span className="text-[11px] text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}

// ─── Closure Details Component ────────────────────────────────────────────────

function ClosureDetailsPanel({
  selectedDate,
  closure,
  onAdd,
  onEdit,
  onDelete,
}: {
  selectedDate: string;
  closure: StoreClosure | null;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon icon="solar:calendar-mark-linear" className="h-5 w-5 text-muted-foreground" />
          {formatDate(selectedDate)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col">
        {closure ? (
          <div className="flex flex-col gap-5 flex-1">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-red-100 p-1">
                  <Icon icon="solar:close-circle-linear" className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Store is Closed</h3>
                  <p className="mt-1 text-sm text-red-800">{closure.name}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex gap-3 pt-4">
              <Button onClick={onEdit} variant="outline" className="flex-1">
                Edit Reason
              </Button>
              <Button onClick={onDelete} variant="destructive" className="flex-1">
                Remove Closure
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10 gap-3">
            <Icon icon="solar:shop-2-linear" className="h-10 w-10 text-emerald-500/60" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Store is Open</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                No closure date for this date. The store will operate during its regular hours.
              </p>
            </div>
            <Button onClick={onAdd} className="mt-2 bg-primary-normal text-black hover:bg-primary-hover">
              <Icon icon="solar:add-circle-linear" className="mr-1.5 h-4 w-4" />
              Add this date as a closure
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Add/Edit Dialog ──────────────────────────────────────────────────────────

function ClosureDialog({
  open,
  onOpenChange,
  date,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  initialData: StoreClosure | null;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [createClosure, { isLoading: isCreating }] = useCreateStoreClosureMutation();
  const [updateClosure, { isLoading: isUpdating }] = useUpdateStoreClosureMutation();

  const isMutating = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a reason for the closure.");
      return;
    }

    try {
      if (initialData) {
        await updateClosure({ closure_id: initialData.id, date, name }).unwrap();
        toast.success("Closure updated.");
      } else {
        await createClosure({ date, name }).unwrap();
        toast.success("Store closure added.");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save store closure."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Store Closure" : "Add Store Closure"}</DialogTitle>
            <DialogDescription>
              {initialData
                ? `Update the closure information for ${formatDate(date)}.`
                : `Mark the store as closed on ${formatDate(date)}.`}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-6">
            <Field data-invalid={!!error}>
              <FieldLabel>Closure Reason <span className="text-red-500">*</span></FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thanksgiving, Maintenance, etc."
                disabled={isMutating}
                autoFocus
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isMutating}
              className="bg-primary-normal text-black hover:bg-primary-hover"
            >
              {isMutating && <Icon icon="svg-spinners:180-ring" className="mr-1.5 h-4 w-4" />}
              {initialData ? "Save Changes" : "Add Closure"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminStoreClosuresPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(toDateKey(now.toISOString()));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // We set limit to 31 to ensure we fetch all closures for the current month
  const { data, isLoading } = useGetStoreClosuresQuery({
    page: 1,
    limit: 31,
    year,
    month,
  });

  const [deleteClosure, { isLoading: isDeleting }] = useDeleteStoreClosureMutation();

  const items = data?.data.items ?? [];

  const closureDates = useMemo<Set<string>>(
    () => new Set(items.map((c) => toDateKey(c.date))),
    [items],
  );
  console.log("closure dates", closureDates)

  const selectedClosure = useMemo(() => {
    return items.find((c) => toDateKey(c.date) === selectedDate) || null;
  }, [items, selectedDate]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      const newMonth = d.getMonth() + 1;
      const newYear = d.getFullYear();
      if (newMonth !== month || newYear !== year) {
        setMonth(newMonth);
        setYear(newYear);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedClosure) return;
    try {
      await deleteClosure(selectedClosure.id).unwrap();
      toast.success("Closure removed successfully.");
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove closure."));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Store Closures"
        description="View and manage days the store is marked as closed. Select a date on the calendar to update it."
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* ── Calendar ─────────────────────────────────── */}
        <Card className="h-fit shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Date</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Click any date to manage its closure status.
            </p>
          </CardHeader>
          <CardContent>
            <ClosureCalendar
              year={year}
              month={month}
              closureDates={closureDates}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPrev={prevMonth}
              onNext={nextMonth}
            />
          </CardContent>
        </Card>

        {/* ── Details Panel ────────────────────────────── */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <ClosureDetailsPanel
              selectedDate={selectedDate}
              closure={selectedClosure}
              onAdd={() => setDialogOpen(true)}
              onEdit={() => setDialogOpen(true)}
              onDelete={() => setConfirmOpen(true)}
            />
          )}
        </div>
      </div>

      <ClosureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        initialData={selectedClosure}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove Store Closure"
        description={`Are you sure you want to reopen the store on ${formatDate(selectedDate)}? This action cannot be undone.`}
        confirmLabel="Remove Closure"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        destructive={true}
      />
    </div>
  );
}
