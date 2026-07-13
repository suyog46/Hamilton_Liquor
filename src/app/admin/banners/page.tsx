import Image from "next/image";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const banners = [
  {
    id: "hero",
    label: "Homepage Hero",
    headline: "Shop Now — Hamilton Liquor Store",
    placement: "Hero banner",
    image: "/Home/hero.jpg",
    active: true,
  },
  {
    id: "advertisement",
    label: "Weekly Special Banner",
    headline: "20% Off Every Second Bottle",
    placement: "Below Categories",
    image: "/category/wine.jpeg",
    active: true,
  },
  {
    id: "seasonal",
    label: "Seasonal Promo",
    headline: "Holiday Deals — Save on Gift Sets",
    placement: "Homepage (scheduled)",
    image: "/category/spirits.jpeg",
    active: false,
  },
];

const AdminBannersPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Homepage Banners"
        description="Manage the hero banner and promotional banners shown on the homepage."
        action={
          <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Banner
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <Card key={banner.id} size="sm" className="overflow-hidden p-0">
            <div className="relative h-32 w-full bg-muted">
              <Image src={banner.image} alt={banner.headline} fill sizes="360px" className="object-cover" />
              <Badge
                variant={banner.active ? "secondary" : "outline"}
                className="absolute top-2 right-2"
              >
                {banner.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardContent className="flex flex-col gap-1 py-3">
              <p className="text-[11px] text-muted-foreground">{banner.label}</p>
              <p className="font-medium">{banner.headline}</p>
              <p className="text-[11px] text-muted-foreground">{banner.placement}</p>
              <div className="flex items-center gap-1 mt-2">
                <Button type="button" variant="outline" size="sm" className="flex-1 gap-1.5">
                  <Icon icon="solar:pen-linear" className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete banner">
                  <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBannersPage;
