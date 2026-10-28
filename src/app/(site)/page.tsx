import Categories from "@/components/HomeSection/Categories/Categories";
import FeaturedProducts from "@/components/HomeSection/FeaturedProducts/FeaturedProducts";
import Hero from "@/components/HomeSection/Hero/Hero";
import ProductShelf from "@/components/HomeSection/ProductShelf/ProductShelf";
import SaleSection from "@/components/HomeSection/SaleSection/SaleSection";
import PickupDeliveryInfo from "@/components/HomeSection/PickupDeliveryInfo/PickupDeliveryInfo";
import GoogleMapSection from "@/components/HomeSection/GoogleMapSection/GoogleMapSection";
import GoogleReviews from "@/components/HomeSection/GoogleReviews/GoogleReviews";
import { core } from "@/lib/api/core";
import {
  getStoreInformation,
  getStoreLocation,
  getOperatingHours,
} from "@/lib/api/store";
import type {
  PublicProductListItem,
  PublicProductListResponse,
} from "@/redux/features/product/productApiSlice";
import type {
  Category,
  CategoryListResponse,
} from "@/redux/features/category/categoryApiSlice";
import type {
  PublicSaleItem,
  PublicSaleListResponse,
} from "@/redux/features/sale/saleApiSlice";

const getProducts = async (query: string): Promise<PublicProductListItem[]> => {
  const res = await core(`products?${query}`);
  if (!res.ok) return [];
  const json: PublicProductListResponse = await res.json();
  return json.data.items ?? [];
};

const getCategories = async (query = "limit=4"): Promise<Category[]> => {
  const res = await core(`categories?${query}`);
  if (!res.ok) return [];
  const json: CategoryListResponse = await res.json();
  return (json.data.items ?? []).filter((category) => category.is_active);
};

const getSales = async (query = "limit=12"): Promise<PublicSaleItem[]> => {
  const res = await core(`sales?${query}`);
  if (!res.ok) return [];
  const json: PublicSaleListResponse = await res.json();
  return json.data.items ?? [];
};

const Home = async () => {
  const [
    newArrivals,
    bestSellers,
    staffPicks,
    featuredProducts,
    categories,
    saleItems,
    storeInformation,
    storeLocation,
    operatingHours,
  ] = await Promise.all([
    getProducts("limit=8&sort_by=created_at&sort_order=desc"),
    getProducts("limit=8&in_stock=true"),
    getProducts("limit=8&is_staff_pick=true"),
    getProducts("limit=10&is_featured=true"),
    getCategories("limit=4"),
    getSales("limit=12"),
    getStoreInformation(),
    getStoreLocation(),
    getOperatingHours(),
  ]);

  return (
    <>
      <Hero />
      <Categories categories={categories} />
      <SaleSection items={saleItems} hideIfEmpty />
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
      <FeaturedProducts products={featuredProducts} />
      <PickupDeliveryInfo />
      <GoogleMapSection
        information={storeInformation}
        location={storeLocation}
        hours={operatingHours}
      />
      <GoogleReviews />
    </>
  );
};

export default Home;
