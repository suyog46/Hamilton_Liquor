"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { isFetchBaseQueryError } from "@/lib/api/isFetchBaseQueryError";
import { cn } from "@/lib/utils";
import {
  type DayOfWeek,
  type OperatingHour,
  useGetOperatingHoursQuery,
  useUpdateOperatingHoursMutation,
} from "@/redux/features/store/storeApiSlice";

const days: Array<{ value: DayOfWeek; label: string; short: string }> = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
];
const weekdays: DayOfWeek[] = days.slice(0, 5).map((d) => d.value);
const weekend: DayOfWeek[] = days.slice(5).map((d) => d.value);
const allDays: DayOfWeek[] = days.map((d) => d.value);

const toInputTime = (value: string) => value.slice(0, 5);
const toApiTime = (value: string) => `${value || "00:00"}:00.000Z`;
const errorMessage = (error: unknown) => {
  if (!isFetchBaseQueryError(error)) return "Unable to save operating hours.";
  const data = error.data as
    | { message?: string; error?: { message?: string } }
    | undefined;
  return (
    data?.error?.message ?? data?.message ?? "Unable to save operating hours."
  );
};

type HourForm = Pick<OperatingHour, "day_of_week" | "is_closed"> & {
  open_time: string;
  close_time: string;
};

export default function AdminStoreHoursPage() {
  const { data, isLoading, isError, refetch } = useGetOperatingHoursQuery();
  const [updateHours, { isLoading: isSaving }] =
    useUpdateOperatingHoursMutation();
  const [hours, setHours] = useState<HourForm[]>([]);

  const [bulkDays, setBulkDays] = useState<Set<DayOfWeek>>(
    new Set(allDays),
  );
  const [bulkOpen, setBulkOpen] = useState("09:00");
  const [bulkClose, setBulkClose] = useState("22:00");
  const [bulkClosed, setBulkClosed] = useState(false);

  useEffect(() => {
    if (!data?.data.hours) return;
    const byDay = new Map(
      data.data.hours.map((hour) => [hour.day_of_week, hour]),
    );

    setHours(
      days.map(({ value }) => {
        const hour = byDay.get(value);
        return {
          day_of_week: value,
          is_closed: hour?.is_closed ?? false,
          open_time: hour?.is_closed
            ? ""
            : hour?.open_time
              ? toInputTime(hour.open_time)
              : "09:00",
          close_time: hour?.is_closed
            ? ""
            : hour?.close_time
              ? toInputTime(hour.close_time)
              : "22:00",
        };
      }),
    );
  }, [data]);

  const updateHour = (index: number, changes: Partial<HourForm>) => {
    setHours((current) =>
      current.map((hour, hourIndex) =>
        hourIndex === index ? { ...hour, ...changes } : hour,
      ),
    );
  };

  const toggleBulkDay = (day: DayOfWeek) => {
    setBulkDays((current) => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const applyBulk = () => {
    if (bulkDays.size === 0) return;
    setHours((current) =>
      current.map((hour) =>
        bulkDays.has(hour.day_of_week)
          ? {
              ...hour,
              is_closed: bulkClosed,
              open_time: bulkClosed ? hour.open_time : bulkOpen,
              close_time: bulkClosed ? hour.close_time : bulkClose,
            }
          : hour,
      ),
    );
    toast.success(
      `Applied to ${bulkDays.size} day${bulkDays.size === 1 ? "" : "s"}. Review below, then save.`,
    );
  };

  const saveHours = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateHours({
        hours: hours.map((hour) => ({
          day_of_week: hour.day_of_week,
          open_time: hour.is_closed == true ? null : toApiTime(hour.open_time),
          close_time:
            hour.is_closed == true ? null : toApiTime(hour.close_time),
          is_closed: hour.is_closed,
        })),
      }).unwrap();
      toast.success("Operating hours updated.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (isLoading) return <Skeleton className="h-[560px] w-full" />;
  if (isError)
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-3 text-center">
          <Icon
            icon="solar:danger-circle-linear"
            className="size-7 text-destructive"
          />
          <p className="text-sm font-semibold">
            Unable to load operating hours.
          </p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <form onSubmit={saveHours} className="flex flex-col gap-5">
      <AdminPageHeader
        title="Operating Hours"
        description="Set the regular weekly hours customers see for your store."
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
            {isSaving ? "Saving…" : "Save hours"}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Quick set</CardTitle>
          <p className="text-xs text-muted-foreground">
            Pick the days that share the same hours, set the times once, and
            apply — no need to enter every day one by one. You can still fine-tune
            any single day below.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleBulkDay(day.value)}
                aria-pressed={bulkDays.has(day.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  bulkDays.has(day.value)
                    ? "border-primary-normal bg-primary-normal/10 text-primary-active"
                    : "border-gray-200 text-muted-foreground hover:border-gray-300",
                )}
              >
                {day.short}
              </button>
            ))}

            <span className="mx-1 h-4 w-px bg-gray-200" />

            <button
              type="button"
              onClick={() => setBulkDays(new Set(allDays))}
              className="text-xs font-medium text-primary-active hover:underline"
            >
              Every day
            </button>
            <button
              type="button"
              onClick={() => setBulkDays(new Set(weekdays))}
              className="text-xs font-medium text-primary-active hover:underline"
            >
              Weekdays
            </button>
            <button
              type="button"
              onClick={() => setBulkDays(new Set(weekend))}
              className="text-xs font-medium text-primary-active hover:underline"
            >
              Weekend
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Opens</Label>
              <Input
                type="time"
                value={bulkOpen}
                disabled={bulkClosed}
                onChange={(event) => setBulkOpen(event.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Closes</Label>
              <Input
                type="time"
                value={bulkClose}
                disabled={bulkClosed}
                onChange={(event) => setBulkClose(event.target.value)}
                className="w-32"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
              <Checkbox
                checked={bulkClosed}
                onCheckedChange={(checked) => setBulkClosed(checked === true)}
              />
              Closed
            </label>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={applyBulk}
              disabled={bulkDays.size === 0}
              className="ml-auto"
            >
              Apply to {bulkDays.size || 0} day
              {bulkDays.size === 1 ? "" : "s"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <p className="text-xs text-muted-foreground">
            Review or override any individual day here.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {hours.map((hour, index) => {
            const day = days.find((entry) => entry.value === hour.day_of_week)!;
            return (
              <div
                key={hour.day_of_week}
                className="grid gap-3 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-[140px_1fr_1fr_auto] sm:items-center"
              >
                <Label className="text-sm font-medium">{day.label}</Label>
                <Input
                  type="time"
                  aria-label={`${day.label} opening time`}
                  value={hour.open_time}
                  disabled={hour.is_closed}
                  onChange={(event) =>
                    updateHour(index, { open_time: event.target.value })
                  }
                />
                <Input
                  type="time"
                  aria-label={`${day.label} closing time`}
                  value={hour.close_time}
                  disabled={hour.is_closed}
                  onChange={(event) =>
                    updateHour(index, { close_time: event.target.value })
                  }
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={hour.is_closed}
                    onCheckedChange={(checked) =>
                      updateHour(index, { is_closed: checked === true })
                    }
                  />
                  Closed
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </form>
  );
}
