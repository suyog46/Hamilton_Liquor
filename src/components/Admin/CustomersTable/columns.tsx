"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  formatCustomerDate,
  formatCustomerMoney,
  getCustomerInitials,
} from "@/lib/utils/customer";
import type { CustomerListItem } from "@/redux/features/customer/customerApiSlice";

export const customerColumns: ColumnDef<CustomerListItem>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original;
      const initials = getCustomerInitials(customer.name);

      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm" className="size-8 ring-1 ring-border">
            <AvatarFallback className="bg-primary-normal/20 text-xs font-semibold text-primary-active">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/admin/customers/${customer.id}`}
              className="text-xs font-semibold text-foreground hover:text-primary-active transition-colors line-clamp-1"
            >
              {customer.name || "Unnamed Customer"}
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{customer.email}</span>
              {customer.is_email_verified ? (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] font-medium border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  Verified
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[9px] font-medium border-amber-200 bg-amber-50 text-amber-700"
                >
                  Unverified
                </Badge>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "order_count",
    header: "Orders",
    cell: ({ row }) => {
      const count = row.original.order_count ?? 0;
      return (
        <div className="text-xs">
          <span className="font-semibold text-foreground">{count.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground ml-1">
            {count === 1 ? "order" : "orders"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "net_spent",
    header: "Net Spent",
    cell: ({ row }) => {
      const customer = row.original;
      const formatted = formatCustomerMoney(customer.net_spent, customer.currency);

      return (
        <div className="text-xs font-semibold text-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "last_order_at",
    header: "Last Order",
    cell: ({ row }) => {
      const lastOrder = row.original.last_order_at;
      if (!lastOrder) {
        return (
          <span className="text-xs text-muted-foreground italic">No orders yet</span>
        );
      }
      return (
        <span className="text-xs text-muted-foreground">
          {formatCustomerDate(lastOrder)}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      return (
        <span className="text-xs text-muted-foreground">
          {formatCustomerDate(row.original.created_at)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <div className="flex items-center justify-end pr-2">
          <Link
            href={`/admin/customers/${customer.id}`}
            aria-label={`View details for ${customer.name}`}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary-active transition-colors p-1 rounded hover:bg-gray-50"
            title="View customer details"
          >
            <Icon icon="solar:eye-linear" className="size-4" />
            <span className="hidden sm:inline text-[11px]">View Details</span>
          </Link>
        </div>
      );
    },
  },
];
