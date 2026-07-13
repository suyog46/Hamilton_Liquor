import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const signups = [
  { contact: "michael.reyes@email.com", channel: "Email", joined: "Mar 12, 2026" },
  { contact: "(443) 555-0187", channel: "SMS", joined: "Mar 10, 2026" },
  { contact: "ava.patel@email.com", channel: "Email", joined: "Mar 8, 2026" },
  { contact: "(410) 555-0165", channel: "SMS", joined: "Mar 3, 2026" },
  { contact: "lena.brooks@email.com", channel: "Email", joined: "Feb 27, 2026" },
];

const AdminMarketingPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="SMS & Email Signups"
        description="Manage your marketing list and send out specials or announcements."
        action={
          <Button type="button" variant="outline" className="gap-1.5">
            <Icon icon="solar:export-linear" className="h-4 w-4" />
            Export List
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-none ring-1 ring-foreground/10 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signups.map((signup) => (
                <TableRow key={signup.contact}>
                  <TableCell className="font-medium">{signup.contact}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{signup.channel}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{signup.joined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send a Campaign</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Subject / SMS headline" />
            <Textarea placeholder="Write your message…" rows={5} />
            <Button type="button" className="bg-primary-normal text-black hover:opacity-90">
              Send to {signups.length} subscribers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMarketingPage;
