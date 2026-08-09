import Advertisement from "@/components/HomeSection/Advertisement/Advertisement";
import Categories from "@/components/HomeSection/Categories/Categories";
import FeaturedProducts from "@/components/HomeSection/FeaturedProducts/FeaturedProducts";
import Hero from "@/components/HomeSection/Hero/Hero";
import ProductShelf from "@/components/HomeSection/ProductShelf/ProductShelf";
import PickupDeliveryInfo from "@/components/HomeSection/PickupDeliveryInfo/PickupDeliveryInfo";
import NewsletterSignup from "@/components/HomeSection/NewsletterSignup/NewsletterSignup";
import GoogleMapSection from "@/components/HomeSection/GoogleMapSection/GoogleMapSection";
import GoogleReviews from "@/components/HomeSection/GoogleReviews/GoogleReviews";
import { core } from "@/lib/api/core";
import type {
  PublicProductListItem,
  PublicProductListResponse,
} from "@/redux/features/product/productApiSlice";

// The catalog has no "best seller" / "staff pick" concept yet — each shelf below
// pulls a genuinely different slice of the live catalog so the homepage isn't
// showing the same four products three times over.
const getProducts = async (query: string): Promise<PublicProductListItem[]> => {
  const res = await core(`products?${query}`);
  if (!res.ok) return [];
  const json: PublicProductListResponse = await res.json();
  return json.data.items;
};

const Home = async () => {
  const [newArrivals, bestSellers, staffPicks] = await Promise.all([
    getProducts("limit=4&sort_by=created_at&sort_order=desc"),
    getProducts("limit=4&sort_by=created_at&sort_order=asc"),
    getProducts("limit=4&sort_by=updated_at&sort_order=desc"),
  ]);

  return (
    <>
      <Hero />
      <Categories />
      {/* Weekly specials promo */}
      <Advertisement />
      <ProductShelf
        eyebrow="Fan Favorites"
        title="Best Sellers"
        products={bestSellers}
        viewAllHref="/shop"
      />
      <ProductShelf
        eyebrow="Curated by Us"
        title="Staff Picks"
        products={staffPicks}
        viewAllHref="/shop"
        tone="dark"
      />
      <ProductShelf
        eyebrow="Just Landed"
        title="New Arrivals"
        products={newArrivals}
        viewAllHref="/new-arrivals"
      />
      <FeaturedProducts />
      <PickupDeliveryInfo />
      <NewsletterSignup />
      <GoogleMapSection />
      <GoogleReviews />
    </>
  );
};

export default Home;
