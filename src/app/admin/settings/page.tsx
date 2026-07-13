import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/utils";

const AdminSettingsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Settings"
        description="Store information, payments, and admin access."
        action={
          <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
            <Icon icon="solar:diskette-linear" className="h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue={siteConfig.name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-phone">Phone</Label>
            <Input id="store-phone" defaultValue={siteConfig.phone} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="store-address">Address</Label>
            <Input id="store-address" defaultValue={siteConfig.address.full} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-email">Contact Email</Label>
            <Input id="store-email" defaultValue={siteConfig.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-social">Social Links</Label>
            <Input id="store-social" placeholder="Facebook, Instagram URLs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Processor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:card-linear" className="h-4 w-4 text-primary-normal" />
              <span className="font-medium">SpotOn</span>
            </div>
            <Badge variant="outline">Pending Verification</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Online checkout integration is pending confirmation of SpotOn API access and card-not-present support
            for alcohol e-commerce. A backup processor will be configured if needed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Store Admin</p>
              <p className="text-[11px] text-muted-foreground">admin@hamiltonliquorstore.com</p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
          <Button type="button" variant="outline" className="w-fit gap-1.5">
            <Icon icon="solar:user-plus-linear" className="h-4 w-4" />
            Invite Staff Member
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
