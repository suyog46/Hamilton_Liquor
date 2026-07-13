import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const coupons = [
  { code: "WELCOME10", type: "Percent", value: "10% off", usage: "142 / ∞", status: "Active", expires: "No expiry" },
  { code: "FIRSTORDER", type: "Percent", value: "10% off first order", usage: "58 / ∞", status: "Active", expires: "No expiry" },
  { code: "HOLIDAY25", type: "Fixed", value: "$25 off $150+", usage: "34 / 200", status: "Active", expires: "Dec 31, 2026" },
  { code: "WINEWKND", type: "Percent", value: "15% off wine", usage: "19 / 100", status: "Scheduled", expires: "Starts Aug 1, 2026" },
  { code: "SUMMER22", type: "Fixed", value: "$10 off $50+", usage: "200 / 200", status: "Expired", expires: "Jun 30, 2026" },
];

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Active: "secondary",
  Scheduled: "outline",
  Expired: "destructive",
};

const AdminCouponsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Coupons & Promotions"
        description="Create and manage discount codes for weekly specials and campaigns."
        action={
          <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Create Coupon
          </Button>
        }
      />

      <div className="rounded-none ring-1 ring-foreground/10 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.code}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>{coupon.type}</TableCell>
                <TableCell>{coupon.value}</TableCell>
                <TableCell>{coupon.usage}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[coupon.status]}>{coupon.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{coupon.expires}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit coupon">
                      <Icon icon="solar:pen-linear" className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete coupon">
                      <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCouponsPage;
