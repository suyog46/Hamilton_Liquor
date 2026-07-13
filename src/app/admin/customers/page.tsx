import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const customers = [
  { name: "Michael Reyes", initials: "MR", email: "michael.reyes@email.com", phone: "(443) 555-0142", orders: 12, spent: 642.5, signedUp: true },
  { name: "Sarah Thompson", initials: "ST", email: "sarah.t@email.com", phone: "(443) 555-0187", orders: 8, spent: 411.2, signedUp: true },
  { name: "James Kim", initials: "JK", email: "james.kim@email.com", phone: "(410) 555-0199", orders: 3, spent: 96.0, signedUp: false },
  { name: "Ava Patel", initials: "AP", email: "ava.patel@email.com", phone: "(443) 555-0122", orders: 5, spent: 214.75, signedUp: true },
  { name: "Daniel Cho", initials: "DC", email: "daniel.cho@email.com", phone: "(410) 555-0165", orders: 2, spent: 88.4, signedUp: false },
  { name: "Lena Brooks", initials: "LB", email: "lena.brooks@email.com", phone: "(443) 555-0108", orders: 6, spent: 305.0, signedUp: true },
];

const AdminCustomersPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Customers"
        description="View customer profiles, order history, and marketing opt-ins."
      />

      <div className="relative w-full sm:max-w-xs">
        <Icon
          icon="solar:magnifer-linear"
          className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input placeholder="Search customers…" className="h-9 pl-8" />
      </div>

      <div className="rounded-none ring-1 ring-foreground/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Marketing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>{customer.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{customer.email}</span>
                    <span className="text-[11px] text-muted-foreground">{customer.phone}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>${customer.spent.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={customer.signedUp ? "secondary" : "outline"}>
                    {customer.signedUp ? "Subscribed" : "Not Subscribed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="View customer">
                    <Icon icon="solar:eye-linear" className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCustomersPage;
