"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/index";
import type { InventoryAdjustment } from "@/redux/features/inventory/inventoryApiSlice";

const REASON_LABELS: Record<InventoryAdjustment["reason"], string> = {
  INITIAL_STOCK: "Initial stock",
  PURCHASE: "Purchase",
  SALE: "Sale",
  RETURN: "Return",
  DAMAGED: "Damaged",
  MANUAL: "Manual",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const inventoryHistoryColumns: ColumnDef<InventoryAdjustment>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => <Badge variant="outline">{REASON_LABELS[row.original.reason]}</Badge>,
  },
  {
    id: "change",
    header: "Change",
    cell: ({ row }) => {
      const change = row.original.quantity_change;
      return (
        <span className={cn("font-medium", change > 0 ? "text-success" : "text-destructive")}>
          {change > 0 ? `+${change}` : change}
        </span>
      );
    },
  },
  {
    id: "before-after",
    header: "Before → After",
    cell: ({ row }) => `${row.original.quantity_before} → ${row.original.quantity_after}`,
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => row.original.note ?? <span className="text-muted-foreground">—</span>,
  },
];
