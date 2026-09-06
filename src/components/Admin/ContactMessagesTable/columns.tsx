"use client";

import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { ContactMessage } from "@/redux/features/contactMessage/contactMessageApiSlice";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

interface ColumnsOptions {
  onView: (contactMessage: ContactMessage) => void;
}

export const getContactMessageColumns = ({
  onView,
}: ColumnsOptions): ColumnDef<ContactMessage>[] => [
  {
    accessorKey: "is_read",
    header: "",
    cell: ({ row }) => (
      <span
        aria-label={row.original.is_read ? "Read" : "Unread"}
        className={
          row.original.is_read
            ? "block size-2 rounded-full bg-transparent"
            : "block size-2 rounded-full bg-primary-normal"
        }
      />
    ),
  },
  {
    accessorKey: "full_name",
    header: "From",
    cell: ({ row }) => {
      const contactMessage = row.original;
      return (
        <button
          type="button"
          onClick={() => onView(contactMessage)}
          className="block min-w-0 text-left"
        >
          <p
            className={
              contactMessage.is_read
                ? "truncate font-medium hover:text-primary-normal"
                : "truncate font-semibold hover:text-primary-normal"
            }
          >
            {contactMessage.full_name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {contactMessage.email}
          </p>
        </button>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const contactMessage = row.original;
      return (
        <div className="min-w-0 max-w-xs">
          <p className="truncate font-medium">{contactMessage.subject}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {contactMessage.message}
          </p>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_read ? "outline" : "success"}>
        {row.original.is_read ? "Read" : "Unread"}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Received",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <button
          type="button"
          aria-label="View message"
          onClick={() => onView(row.original)}
          className="cursor-pointer text-muted-foreground transition-colors hover:text-primary-normal"
        >
          <Icon icon="solar:eye-linear" className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];
