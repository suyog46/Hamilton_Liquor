import Link from "next/link";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  { label: "Total Revenue", value: "$24,850", icon: "solar:wallet-money-linear" },
  { label: "Orders", value: "312", icon: "solar:bag-check-linear" },
  { label: "Customers", value: "1,204", icon: "solar:users-group-rounded-linear" },
  { label: "Products", value: "86", icon: "solar:box-linear" },
];

const quickLinks = [
  { name: "Add Product", href: "/admin/products", icon: "solar:add-circle-linear" },
  { name: "View Orders", href: "/admin/orders", icon: "solar:bag-check-linear" },
  { name: "Create Coupon", href: "/admin/coupons", icon: "solar:tag-price-linear" },
  { name: "Edit Store Hours", href: "/admin/store-hours", icon: "solar:clock-circle-linear" },
];

const recentOrders = [
  { id: "HLS-1042", customer: "Michael Reyes", fulfillment: "Pickup", total: "$84.50", status: "New" },
  { id: "HLS-1041", customer: "Sarah Thompson", fulfillment: "Delivery", total: "$132.20", status: "Confirmed" },
  { id: "HLS-1040", customer: "James Kim", fulfillment: "Pickup", total: "$22.00", status: "Preparing" },
  { id: "HLS-1039", customer: "Ava Patel", fulfillment: "Pickup", total: "$58.75", status: "Ready for Pickup" },
];

const AdminDashboardPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Overview of your store&apos;s performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-normal text-muted-foreground">{stat.label}</CardTitle>
              <Icon icon={stat.icon} className="h-4 w-4 text-primary-normal" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-2 p-4 ring-1 ring-foreground/10 bg-card text-xs font-medium hover:bg-muted transition-colors"
          >
            <Icon icon={link.icon} className="h-5 w-5 text-primary-normal" />
            {link.name}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-xs font-medium text-primary-normal hover:opacity-80">
            View all &rarr;
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="pr-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="pl-4 font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.fulfillment}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell className="pr-4">
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
