import ProductCard from "@/components/Common/ProductCard/ProductCard";
import GlowBackground from "@/components/Common/GlowBackground/GlowBackground";
import type { Product } from "@/lib/utils/products";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface ProductShelfProps {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllHref: string;
  badgeLabel?: string;
  tone?: "light" | "dark";
}

const ProductShelf = ({ eyebrow, title, products, viewAllHref, badgeLabel, tone = "light" }: ProductShelfProps) => {
  const isDark = tone === "dark";

  return (
    <section className={isDark ? "relative bg-black py-16 overflow-hidden" : "bg-white py-16"}>
      {isDark && <GlowBackground />}
      <div className="relative max-w-[1280px] mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">{eyebrow}</span>
              {badgeLabel && <Badge className="bg-primary-normal text-black">{badgeLabel}</Badge>}
            </div>
            <h2 className={`font-title text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}>
              {title}
            </h2>
          </div>
          <a href={viewAllHref} className="hidden sm:block text-sm font-semibold text-primary-normal hover:opacity-80">
            View all &rarr;
          </a>
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

        <a
          href={viewAllHref}
          className="mt-6 sm:hidden flex items-center justify-center w-full px-6 py-3 rounded-lg border border-primary-normal text-sm font-semibold text-primary-normal"
        >
          View all {title}
        </a>
      </div>
    </section>
  );
};

export default ProductShelf;
