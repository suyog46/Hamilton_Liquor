import Advertisement from "@/components/HomeSection/Advertisement/Advertisement";
import Categories from "@/components/HomeSection/Categories/Categories";
import FeaturedProducts from "@/components/HomeSection/FeaturedProducts/FeaturedProducts";
import Hero from "@/components/HomeSection/Hero/Hero";
import ProductShelf from "@/components/HomeSection/ProductShelf/ProductShelf";
import PickupDeliveryInfo from "@/components/HomeSection/PickupDeliveryInfo/PickupDeliveryInfo";
import NewsletterSignup from "@/components/HomeSection/NewsletterSignup/NewsletterSignup";
import GoogleMapSection from "@/components/HomeSection/GoogleMapSection/GoogleMapSection";
import GoogleReviews from "@/components/HomeSection/GoogleReviews/GoogleReviews";
import { getProductsByTag } from "@/lib/utils/products";

const Home = () => {
  const bestSellers = getProductsByTag("best-seller").slice(0, 4);
  const staffPicks = getProductsByTag("staff-pick").slice(0, 4);
  const newArrivals = getProductsByTag("new-arrival").slice(0, 4);
  const onSale = getProductsByTag("on-sale").slice(0, 4);

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
      <ProductShelf
        eyebrow="Limited Time"
        title="On Sale Now"
        products={onSale}
        viewAllHref="/specials"
        badgeLabel="Save up to 20%"
      />
      <PickupDeliveryInfo />
      <NewsletterSignup />
      <GoogleMapSection />
      <GoogleReviews />
    </>
  );
};

export default Home;
