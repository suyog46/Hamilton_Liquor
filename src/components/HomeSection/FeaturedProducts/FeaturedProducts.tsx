import ProductCard from "@/components/Common/ProductCard/ProductCard";
import GlowBackground from "@/components/Common/GlowBackground/GlowBackground";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { products } from "@/lib/utils/products";

const FeaturedProducts = () => {
  return (
    <section className="relative bg-gray-50 py-16 overflow-hidden">
      <GlowBackground />
      <div className="relative max-w-[1280px] mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Selection</span>
            <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">Featured Bottles</h2>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a href="/shop" className="text-sm font-semibold text-primary-normal hover:opacity-80">
              View all &rarr;
            </a>
          </div>
        </div>

        <Carousel>
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id}>
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-end gap-2 mt-6">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedProducts;
