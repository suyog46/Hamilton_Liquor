"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100];

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onPageChange: (page: number) => void;
  limit?: number;
  limitOptions?: number[];
  onLimitChange?: (limit: number) => void;
  disabled?: boolean;
}

// Core, resource-agnostic pagination bar: previous/next, a manually
// editable page-number field, and (when limit/onLimitChange are passed)
// a page-size selector wired into the "Showing X of Y total" line.
// Reusable by any DataTable-backed list.
export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  hasNext,
  hasPrevious,
  onPageChange,
  limit,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  onLimitChange,
  disabled,
}: DataTablePaginationProps) {
  const [inputValue, setInputValue] = useState(String(page));
  const lastPage = Math.max(totalPages, 1);

  useEffect(() => {
    setInputValue(String(page));
  }, [page]);

  const commit = () => {
    const parsed = Number(inputValue);
    if (!Number.isFinite(parsed) || inputValue.trim() === "") {
      setInputValue(String(page));
      return;
    }
    const clamped = Math.min(Math.max(Math.trunc(parsed), 1), lastPage);
    setInputValue(String(clamped));
    if (clamped !== page) onPageChange(clamped);
  };

  const limitItems = limitOptions.map((n) => ({ value: String(n), label: String(n) }));

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row py-10">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span>Showing</span>
        {onLimitChange && limit ? (
          <Select
            items={limitItems}
            value={String(limit)}
            onValueChange={(value) => value && onLimitChange(Number(value))}
          >
            <SelectTrigger size="sm" className="h-7 w-16 rounded-md px-2" disabled={disabled}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{limit ?? "—"}</span>
        )}
        <span>of {typeof totalItems === "number" ? totalItems : "—"} total</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 rounded-md"
          disabled={disabled || hasPrevious === false}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Page</span>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            disabled={disabled}
            inputMode="numeric"
            aria-label="Page number"
            className="h-7 w-12 rounded-md px-1.5 text-center"
          />
          <span>of {lastPage}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 rounded-md"
          disabled={disabled || hasNext === false}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
