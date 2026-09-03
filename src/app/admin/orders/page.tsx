"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatOrderDate, formatOrderMoney, fulfillmentLabel, orderStatusLabel, statusTone } from "@/components/Order/orderDisplay";
import { useGetAdminOrdersQuery } from "@/redux/features/order/orderApiSlice";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminOrdersQuery({ page, limit });
  const orders = data?.data.items ?? [];
  const pagination = data?.data.pagination;

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Orders" description="Review and fulfill pickup and delivery orders." />
      {isError ? (
        <div className="flex flex-col items-center gap-2 border bg-card py-16 text-center">
          <Icon icon="solar:danger-circle-linear" className="size-7 text-destructive" />
          <p className="text-xs text-muted-foreground">Failed to load orders.</p>
          <button onClick={() => refetch()} className="text-xs font-semibold text-primary-active">Try again</button>
        </div>
      ) : isLoading ? <Skeleton className="h-[480px] w-full" /> : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border bg-card py-16 text-center">
          <Icon icon="solar:bag-4-linear" className="size-7 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No orders have been placed yet.</p>
        </div>
      ) : (
        <div className="rounded-none bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Method</TableHead><TableHead>Progress</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Placed</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><div className="flex flex-col gap-1.5"><Link href={`/admin/orders/${order.id}`} className="font-semibold hover:text-primary-active">#{order.id.slice(-8).toUpperCase()}</Link><span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusTone[order.status]}`}>{orderStatusLabel[order.status]}</span></div></TableCell>
                  <TableCell><p className="font-medium">{order.customer.name}</p><p className="text-[11px] text-muted-foreground">{order.customer.email}</p></TableCell>
                  <TableCell><span className="inline-flex items-center gap-1.5"><Icon icon={order.fulfillment_method === "PICKUP" ? "solar:bag-check-outline" : "solar:delivery-outline"} className="size-4 text-muted-foreground" />{order.fulfillment_method === "PICKUP" ? "Pickup" : "Delivery"}</span></TableCell>
                  <TableCell className="font-medium">{fulfillmentLabel[order.fulfillment_status]}</TableCell>
                  <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                  <TableCell className="font-semibold">{formatOrderMoney(order.total, order.currency)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatOrderDate(order.created_at)}</TableCell>
                  <TableCell className="text-right"><Link href={`/admin/orders/${order.id}`} aria-label={`View order ${order.id}`} className="inline-flex size-8 items-center justify-center hover:text-primary-active"><Icon icon="solar:alt-arrow-right-linear" className="size-4" /></Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {pagination && pagination.total_pages > 0 && <DataTablePagination page={pagination.page} limit={pagination.limit || limit} totalPages={pagination.total_pages} totalItems={pagination.total_items} hasNext={pagination.has_next} hasPrevious={pagination.has_previous} disabled={isFetching} onPageChange={setPage} onLimitChange={(next) => { setLimit(next); setPage(1); }} />}
    </div>
  );
}
