import type {
  DayOfWeek,
  OperatingHour,
} from "@/redux/features/store/storeApiSlice";

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const dayOrder: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const formatStoreTime = (value: string | null | undefined) => {
  if (!value) return "";
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const suffix = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")}${suffix}`;
};

export const formatOperatingHours = (hours: OperatingHour[]) => {
  const ordered = dayOrder.map((day) =>
    hours.find((entry) => entry.day_of_week === day),
  );
  const groups: Array<{ start: string; end: string; label: string }> = [];

  ordered.forEach((entry, index) => {
    if (!entry) return;
    const label = entry.is_closed
      ? "Closed"
      : `${formatStoreTime(entry.open_time)}–${formatStoreTime(entry.close_time)}`;
    const previous = groups.at(-1);
    const previousEntry = ordered[index - 1];
    const previousLabel = previousEntry
      ? previousEntry.is_closed
        ? "Closed"
        : `${formatStoreTime(previousEntry.open_time)}–${formatStoreTime(previousEntry.close_time)}`
      : undefined;

    if (previous && previousLabel === label) {
      previous.end = dayLabels[dayOrder[index]];
      return;
    }

    groups.push({
      start: dayLabels[dayOrder[index]],
      end: dayLabels[dayOrder[index]],
      label,
    });
  });

  return groups
    .map(
      ({ start, end, label }) =>
        `${start === end ? start : `${start}–${end}`} ${label}`,
    )
    .join(" · ");
};

export const formatFullOperatingHours = (hours: OperatingHour[]) =>
  dayOrder
    .map((day) => {
      const entry = hours.find((hour) => hour.day_of_week === day);
      if (!entry) return null;
      return {
        day: dayLabels[day],
        time: entry.is_closed
          ? "Closed"
          : `${formatStoreTime(entry.open_time)} – ${formatStoreTime(entry.close_time)}`,
      };
    })
    .filter((entry): entry is { day: string; time: string } => Boolean(entry));
