import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OrderStatus =
  | "New"
  | "Confirmed"
  | "Preparing"
  | "Ready for Pickup"
  | "Out for Delivery"
  | "Completed"
  | "Cancelled"
  | "Refunded";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  New: "outline",
  Confirmed: "secondary",
  Preparing: "secondary",
  "Ready for Pickup": "default",
  "Out for Delivery": "default",
  Completed: "secondary",
  Cancelled: "destructive",
  Refunded: "destructive",
};

const orders: {
  id: string;
  customer: string;
  fulfillment: "Pickup" | "Delivery";
  items: number;
  total: number;
  status: OrderStatus;
  placed: string;
}[] = [
  { id: "HLS-1042", customer: "Michael Reyes", fulfillment: "Pickup", items: 3, total: 84.5, status: "New", placed: "Today, 2:14 PM" },
  { id: "HLS-1041", customer: "Sarah Thompson", fulfillment: "Delivery", items: 5, total: 132.2, status: "Confirmed", placed: "Today, 1:02 PM" },
  { id: "HLS-1040", customer: "James Kim", fulfillment: "Pickup", items: 1, total: 22.0, status: "Preparing", placed: "Today, 11:47 AM" },
  { id: "HLS-1039", customer: "Ava Patel", fulfillment: "Pickup", items: 2, total: 58.75, status: "Ready for Pickup", placed: "Today, 10:30 AM" },
  { id: "HLS-1038", customer: "Daniel Cho", fulfillment: "Delivery", items: 4, total: 96.4, status: "Out for Delivery", placed: "Yesterday, 6:52 PM" },
  { id: "HLS-1037", customer: "Lena Brooks", fulfillment: "Pickup", items: 2, total: 41.0, status: "Completed", placed: "Yesterday, 4:10 PM" },
  { id: "HLS-1036", customer: "Marcus Bell", fulfillment: "Delivery", items: 1, total: 19.99, status: "Cancelled", placed: "Yesterday, 1:15 PM" },
  { id: "HLS-1035", customer: "Priya Nair", fulfillment: "Pickup", items: 3, total: 67.25, status: "Refunded", placed: "2 days ago" },
];

const orderStatuses: OrderStatus[] = [
  "New",
  "Confirmed",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
  "Cancelled",
  "Refunded",
];

const AdminOrdersPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Orders"
        description="Accept, prepare, and fulfill pickup and delivery orders."
        action={
          <Button type="button" variant="outline" className="gap-1.5">
            <Icon icon="solar:export-linear" className="h-4 w-4" />
            Export Orders
          </Button>
        }
      />

      <div className="relative w-full sm:max-w-xs">
        <Icon
          icon="solar:magnifer-linear"
          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input placeholder="Search by order # or customer…" className="h-9 pl-8" />
      </div>

      <div className="rounded-none ring-1 ring-foreground/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      icon={order.fulfillment === "Pickup" ? "solar:bag-check-outline" : "solar:delivery-outline"}
                      className="h-3.5 w-3.5 text-muted-foreground"
                    />
                    {order.fulfillment}
                  </span>
                </TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.placed}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Order actions" />
                      }
                    >
                      <Icon icon="solar:menu-dots-bold" className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      {orderStatuses.map((status) => (
                        <DropdownMenuItem key={status}>{status}</DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Icon icon="solar:printer-linear" />
                        Print Receipt
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        <Icon icon="solar:close-circle-linear" />
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
