import Image from "next/image";
import { Icon } from "@iconify/react";
import AdminPageHeader from "@/components/Admin/AdminPageHeader/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    name: "Wine",
    slug: "wine",
    image: "/category/wine.jpeg",
    subcategories: ["Red", "White", "Rosé", "Sparkling", "Champagne", "Cabernet Sauvignon", "Pinot Noir", "Merlot", "Chardonnay", "Sauvignon Blanc", "Pinot Grigio", "Riesling", "Moscato"],
  },
  {
    name: "Spirits",
    slug: "spirits",
    image: "/category/spirits.jpeg",
    subcategories: ["Vodka", "Whiskey", "Bourbon", "Scotch", "Irish Whiskey", "Canadian Whiskey", "Tequila", "Mezcal", "Rum", "Gin", "Brandy", "Cognac", "Liqueur", "Cordials", "Ready-to-Drink"],
  },
  {
    name: "Beer",
    slug: "beer",
    image: "/category/beer.jpeg",
    subcategories: ["Domestic", "Imported", "Craft", "IPA", "Lager", "Ale", "Stout", "Pilsner", "Hard Seltzer", "Malt Beverages", "Non-Alcoholic"],
  },
  {
    name: "Mixers & Extras",
    slug: "mixers-extras",
    image: "/category/mixers.jpeg",
    subcategories: ["Mixers", "Soda", "Juice", "Tonic Water", "Club Soda", "Ginger Beer", "Energy Drinks", "Ice", "Snacks", "Cups"],
  },
];

const AdminCategoriesPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Categories"
        description="Manage the top-level shop categories and their subcategories."
        action={
          <Button type="button" className="gap-1.5 bg-primary-normal text-black hover:opacity-90">
            <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card key={category.slug} className="flex-row gap-3 p-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-none bg-muted">
              <Image src={category.image} alt={category.name} fill sizes="80px" className="object-cover" />
            </div>
            <CardContent className="flex-1 px-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-[11px] text-muted-foreground">/{category.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit category">
                    <Icon icon="solar:pen-linear" className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete category">
                    <Icon icon="solar:trash-bin-minimalistic-linear" className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {category.subcategories.slice(0, 6).map((sub) => (
                  <Badge key={sub} variant="outline">
                    {sub}
                  </Badge>
                ))}
                {category.subcategories.length > 6 && (
                  <Badge variant="outline">+{category.subcategories.length - 6} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
