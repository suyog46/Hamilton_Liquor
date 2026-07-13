import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminDeliveryZonesPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Delivery Zones"
        description="Delivery is only enabled once Hamilton Liquor Store confirms it is legally permitted and licensed."
        action={
          <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
            <Icon icon="solar:diskette-linear" className="h-4 w-4" />
            Save Settings
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delivery Enabled</p>
              <p className="text-[11px] text-muted-foreground">Turn on once licensing is confirmed.</p>
            </div>
            <Badge variant="outline">Disabled — Pending Approval</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="radius">Delivery Radius (miles)</Label>
              <Input id="radius" type="text" defaultValue="2 – 2.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zips">Allowed ZIP Codes</Label>
              <Input id="zips" type="text" defaultValue="21214, 21206, 21218" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fee">Delivery Fee</Label>
              <Input id="fee" type="text" defaultValue="$4.99" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="free-threshold">Free Delivery Over</Label>
              <Input id="free-threshold" type="text" defaultValue="$200.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minimum">Minimum Order</Label>
              <Input id="minimum" type="text" defaultValue="$30.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delivery-hours">Delivery Hours</Label>
              <Input id="delivery-hours" type="text" defaultValue="Same as store hours" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <p className="font-medium">Handoff Requirements</p>
          <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary-normal" />
              Valid government-issued photo ID required at handoff
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary-normal" />
              Customer must be 21 or older
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary-normal" />
              Alcohol cannot be left unattended
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="h-3.5 w-3.5 text-primary-normal" />
              Driver may refuse delivery if ID is invalid or customer appears intoxicated
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeliveryZonesPage;
