"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, useDayPicker, type CalendarMonth } from "react-day-picker";
import { format, parse, isValid, startOfDay } from "date-fns";
import { Icon } from "@iconify/react";
import "react-day-picker/dist/style.css";

/** Custom caption: [←]  Month Year  [→] */
function MonthCaption({ calendarMonth }: { calendarMonth: CalendarMonth }) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-amber-50 text-[#E3B97D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous month"
      >
        <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
      </button>

      <span className="text-sm font-semibold text-slate-800">
        {format(calendarMonth.date, "MMMM yyyy")}
      </span>

      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-amber-50 text-[#E3B97D] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
      </button>
    </div>
  );
}

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

function parseLocal(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
  return isValid(d) ? d : undefined;
}

export default function DateTimePicker({
  value,
  onChange,
  min,
  disabled,
  placeholder = "Select date & time",
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseLocal(value);
  const minDate = min ? parseLocal(min) : startOfDay(new Date());
  const timeValue = selected ? format(selected, "HH:mm") : "00:00";

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const [h, m] = timeValue.split(":").map(Number);
    day.setHours(h, m, 0, 0);
    onChange(format(day, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    const base = selected ?? minDate ?? new Date();
    const updated = new Date(base);
    updated.setHours(h, m, 0, 0);
    onChange(format(updated, "yyyy-MM-dd'T'HH:mm"));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = selected ? format(selected, "MMM d, yyyy  h:mm aa") : placeholder;

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-left shadow-xs transition-all hover:border-[#E3B97D] hover:ring-2 hover:ring-[#E3B97D]/20 focus:outline-none focus:border-[#E3B97D] focus:ring-2 focus:ring-[#E3B97D]/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {displayLabel}
        </span>
        <Icon icon="solar:calendar-linear" className="h-4 w-4 shrink-0 text-[#E3B97D]" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 rounded-xl border border-[#E3B97D]/30 bg-white shadow-xl ring-1 ring-[#E3B97D]/10 overflow-hidden left-0 top-full">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDaySelect}
            disabled={minDate ? { before: minDate } : undefined}
            components={{ MonthCaption, Nav: () => <></> }}
            classNames={{
              root: "p-3",
              weekdays: "grid grid-cols-7",
              weekday: "text-[10px] font-medium text-slate-400 text-center py-1",
              week: "grid grid-cols-7",
              day: "text-center",
              day_button: "w-8 h-8 text-sm rounded-lg mx-auto flex items-center justify-center hover:bg-amber-50 hover:text-[#C28E47] transition-colors focus:outline-none",
              selected: "[&>button]:!bg-[#E3B97D] [&>button]:!text-white [&>button]:font-semibold",
              today: "[&>button]:border [&>button]:border-[#E3B97D]/60 [&>button]:text-[#C28E47] [&>button]:font-medium",
              disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-inherit",
              outside: "[&>button]:opacity-30",
              hidden: "invisible",
            }}
          />
          <div className="border-t border-[#E3B97D]/20 bg-amber-50/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <Icon icon="solar:clock-circle-linear" className="h-4 w-4 text-[#E3B97D] shrink-0" />
              <span className="text-xs font-medium text-slate-500">Time</span>
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="ml-auto rounded-lg border border-[#E3B97D]/40 bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E3B97D]/30 focus:border-[#E3B97D] accent-[#E3B97D] [color-scheme:light]"
              />
            </div>
          </div>
          <div className="px-4 pb-3 pt-2 bg-amber-50/60">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-[#E3B97D] py-1.5 text-sm font-semibold text-white hover:bg-[#D4A362] active:bg-[#C28E47] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
