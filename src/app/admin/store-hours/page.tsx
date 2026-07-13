import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/utils";

const AdminStoreHoursPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Store Hours"
        description="Update your regular weekly hours and add a holiday hours note."
        action={
          <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
            <Icon icon="solar:diskette-linear" className="h-4 w-4" />
            Save Hours
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3">
          {siteConfig.hours.map((entry) => {
            const [open, close] = entry.time === "Closed" ? ["", ""] : entry.time.split("–").map((t) => t.trim());
            return (
              <div key={entry.day} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_auto] items-center gap-2">
                <Label className="text-sm font-medium">{entry.day}</Label>
                <Input defaultValue={open} placeholder="Open" disabled={entry.time === "Closed"} />
                <Input defaultValue={close} placeholder="Close" disabled={entry.time === "Closed"} />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                  <input type="checkbox" defaultChecked={entry.time === "Closed"} className="size-3.5" />
                  Closed
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="holiday-note" className="text-sm font-medium">
            Holiday Hours Note
          </Label>
          <Textarea id="holiday-note" defaultValue={siteConfig.holidayNote} rows={3} />
          <p className="text-[11px] text-muted-foreground">
            Shown in the footer and on the Location &amp; Hours page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStoreHoursPage;
