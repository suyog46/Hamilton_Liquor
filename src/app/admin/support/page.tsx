import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";

const helpTopics = [
  {
    title: "Adding & Editing Products",
    description: "How to add products manually or import a batch via CSV.",
    icon: "solar:box-linear",
  },
  {
    title: "Managing Orders",
    description:
      "Accepting, preparing, and updating pickup or delivery status.",
    icon: "solar:bag-check-linear",
  },
  {
    title: "Store Hours & Banners",
    description: "Updating hours, holiday notices, and homepage promotions.",
    icon: "solar:clock-circle-linear",
  },
  {
    title: "Coupons & Marketing",
    description: "Creating discount codes and messaging your SMS/email list.",
    icon: "solar:tag-price-linear",
  },
];

const AdminSupportPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Help & Support"
        description="Guides and contact info for managing your store."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {helpTopics.map((topic) => (
          <Card key={topic.title}>
            <CardContent className="flex items-start gap-3">
              <Icon
                icon={topic.icon}
                className="h-5 w-5 text-primary-normal shrink-0 mt-0.5"
              />
              <div>
                <p className="font-medium">{topic.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {topic.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="font-medium text-sm">Need help?</p>
            <p className="text-xs text-muted-foreground">
              Contact technical support directly via WhatsApp for quick assistance.
            </p>
          </div>
          <a
            href="https://wa.me/9779866396831"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 text-xs font-semibold transition-colors w-fit shrink-0 shadow-xs"
          >
            <Icon icon="logos:whatsapp-icon" className="size-4" />
            Chat on WhatsApp (+977 9866396831)
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportPage;
