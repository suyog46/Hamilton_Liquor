import ProductCard from "@/components/Common/ProductCard/ProductCard";
import { products } from "@/lib/utils/products";

const FeaturedProducts = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Selection</span>
            <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">Featured Bottles</h2>
          </div>
          <a href="/shop" className="hidden sm:block text-sm font-semibold text-primary-normal hover:opacity-80">
            View all &rarr;
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
