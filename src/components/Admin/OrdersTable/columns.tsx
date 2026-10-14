"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  formatOrderDate,
  formatOrderMoney,
  fulfillmentLabel,
  orderStatusLabel,
  statusTone,
} from "@/components/Order/orderDisplay";
import type { AdminOrder } from "@/redux/features/order/orderApiSlice";

export const orderColumns: ColumnDef<AdminOrder>[] = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex flex-col gap-1.5">
          <Link
            href={`/admin/orders/${order.id}`}
            className="font-mono text-xs font-semibold text-foreground hover:text-primary-active transition-colors"
          >
            #{order.id.slice(-8).toUpperCase()}
          </Link>
          <span
            className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone[order.status]}`}
          >
            {orderStatusLabel[order.status]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex flex-col">
          {customer.id ? (
            <Link
              href={`/admin/customers/${customer.id}`}
              className="font-medium text-xs text-foreground hover:text-primary-active hover:underline line-clamp-1"
            >
              {customer.name}
            </Link>
          ) : (
            <p className="font-medium text-xs text-foreground line-clamp-1">{customer.name}</p>
          )}
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {customer.email}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "fulfillment_method",
    header: "Method",
    cell: ({ row }) => {
      const isPickup = row.original.fulfillment_method === "PICKUP";
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
          <Icon
            icon={isPickup ? "solar:bag-check-outline" : "solar:delivery-outline"}
            className="size-4 text-muted-foreground"
          />
          {isPickup ? "Pickup" : "Delivery"}
        </span>
      );
    },
  },
  {
    accessorKey: "fulfillment_status",
    header: "Progress",
    cell: ({ row }) => {
      return (
        <span className="text-xs font-medium text-foreground">
          {fulfillmentLabel[row.original.fulfillment_status]}
        </span>
      );
    },
  },
  {
    id: "items_count",
    header: "Items",
    cell: ({ row }) => {
      const totalItems = row.original.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return (
        <span className="text-xs text-muted-foreground">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <span className="text-xs font-semibold text-foreground">
          {formatOrderMoney(order.total, order.currency)}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Placed",
    cell: ({ row }) => {
      return (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatOrderDate(row.original.created_at)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex items-center justify-end pr-2">
          <Link
            href={`/admin/orders/${order.id}`}
            aria-label={`View order ${order.id}`}
            className="inline-flex size-8 items-center justify-center rounded hover:bg-gray-50 text-muted-foreground hover:text-primary-active transition-colors"
            title="View order details"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
          </Link>
        </div>
      );
    },
  },
];
