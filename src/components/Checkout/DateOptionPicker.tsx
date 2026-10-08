import { formatInTimeZone } from "date-fns-tz";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

const STORE_TIMEZONE = "America/New_York";

export const toDateInputValue = (date: Date) =>
  formatInTimeZone(date, STORE_TIMEZONE, "yyyy-MM-dd");

export const getTodayValue = () =>
  formatInTimeZone(new Date(), STORE_TIMEZONE, "yyyy-MM-dd");

export const getTomorrowValue = () =>
  formatInTimeZone(addDays(new Date(), 1), STORE_TIMEZONE, "yyyy-MM-dd");

interface DateOptionPickerProps {
  value: string;
  onChange: (date: string) => void;
}

// Both pickup and delivery are limited to Today / Tomorrow — that's all the
// backend supports scheduling against.
const DateOptionPicker = ({ value, onChange }: DateOptionPickerProps) => {
  const todayValue = getTodayValue();
  const tomorrowValue = getTomorrowValue();

  const pillClass = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "border-primary-normal bg-primary-normal/10 text-primary-active"
        : "border-gray-200 text-gray-600 hover:border-gray-300",
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(todayValue)}
        className={pillClass(value === todayValue)}
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange(tomorrowValue)}
        className={pillClass(value === tomorrowValue)}
      >
        Tomorrow
      </button>
    </div>
  );
};

export default DateOptionPicker;
