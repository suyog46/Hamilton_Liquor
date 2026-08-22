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

const getProducts = async (query: string): Promise<PublicProductListItem[]> => {
  const res = await core(`products?${query}`);
  if (!res.ok) return [];
  const json: PublicProductListResponse = await res.json();
  return json.data.items;
};

const Home = async () => {
  const [newArrivals, bestSellers, staffPicks] = await Promise.all([
    getProducts("limit=4&sort_by=created_at&sort_order=desc"),
    getProducts("limit=4&in_stock=true"),
    getProducts("limit=4&is_staff_pick=true"),
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
