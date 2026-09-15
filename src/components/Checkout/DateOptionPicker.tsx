"use client";

import { cn } from "@/lib/utils";

export const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayValue = () => toDateInputValue(new Date());
export const getTomorrowValue = () =>
  toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));

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
