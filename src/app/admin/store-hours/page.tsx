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
  type DayOfWeek,
  type OperatingHour,
  useGetOperatingHoursQuery,
  useUpdateOperatingHoursMutation,
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
          <CardTitle>Weekly schedule</CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter opening and closing times in your local timezone.
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
                  <input
                    type="checkbox"
                    checked={hour.is_closed}
                    onChange={(event) =>
                      updateHour(index, { is_closed: event.target.checked })
                    }
                    className="size-3.5 accent-[var(--primary-normal)]"
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
