import { Icon } from "@iconify/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import ProductDetailActions from "@/components/Shop/ProductDetailActions/ProductDetailActions";
import { Badge } from "@/components/ui/badge";
import {
  allProducts,
  getProductById,
  getTopCategory,
  topCategorySlugs,
  type Product,
} from "@/lib/utils/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const badgeLabels: Record<string, string> = {
  "on-sale": "On Sale",
  "best-seller": "Best Seller",
  "staff-pick": "Staff Pick",
  "new-arrival": "New",
};

export const generateStaticParams = () => allProducts.map((product) => ({ id: product.id }));

export const generateMetadata = async ({ params }: ProductPageProps): Promise<Metadata> => {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return { title: "Product Not Found | Hamilton Liquor Store" };
  }

  return {
    title: `${product.name} | Hamilton Liquor Store`,
    description: product.description ?? `${product.name} — ${product.category}, ${product.volume}. Available for pickup at Hamilton Liquor Store in Baltimore, MD.`,
  };
};

const getRelatedProducts = (product: Product) =>
  allProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

const getSimilarProducts = (product: Product, excludeIds: string[]) => {
  const byTag = allProducts.filter(
    (p) => p.id !== product.id && !excludeIds.includes(p.id) && p.tags?.some((tag) => product.tags?.includes(tag))
  );

  if (byTag.length > 0) return byTag.slice(0, 4);

  return allProducts
    .filter((p) => p.id !== product.id && !excludeIds.includes(p.id) && getTopCategory(p) === getTopCategory(product))
    .slice(0, 4);
};

const ProductDetailPage = async ({ params }: ProductPageProps) => {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const topCategory = getTopCategory(product);
  const relatedProducts = getRelatedProducts(product);
  const similarProducts = getSimilarProducts(
    product,
    relatedProducts.map((p) => p.id)
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 pt-20 sm:pt-24">
        <nav
          aria-label="Breadcrumb"
          className="max-w-[1280px] mx-auto px-6 py-4 flex items-center flex-wrap gap-1.5 text-xs text-gray-500"
        >
          <Link href="/" className="hover:text-primary-normal transition-colors">
            Home
          </Link>
          <Icon icon="material-symbols:chevron-right" className="w-3.5 h-3.5 text-gray-300" />
          <Link href={`/${topCategorySlugs[topCategory]}`} className="hover:text-primary-normal transition-colors">
            {topCategory}
          </Link>
          <Icon icon="material-symbols:chevron-right" className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-black font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product detail */}
      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative h-80 sm:h-[28rem] rounded-2xl overflow-hidden bg-gray-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover ${!product.inStock ? "opacity-50 grayscale" : ""}`}
            />
            {product.tags?.[0] && (
              <span className="absolute top-4 left-4 text-xs font-semibold uppercase tracking-wide text-black bg-primary-normal px-3 py-1.5 rounded-full">
                {badgeLabels[product.tags[0]]}
              </span>
            )}
            {!product.inStock && (
              <span className="absolute inset-x-0 bottom-0 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white bg-black/80">
                Out of Stock
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{product.brand}</span>
              <h1 className="font-title text-2xl sm:text-3xl font-bold text-black leading-tight mt-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-2">
                <Icon icon="solar:star-bold" className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                <span className="text-xs text-gray-400">based on customer reviews</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-black">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              <Badge variant={product.inStock ? "secondary" : "destructive"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-gray-100">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Category</p>
                <p className="text-sm font-medium text-black">{topCategory}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Alcohol Type</p>
                <p className="text-sm font-medium text-black">{product.category}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Size</p>
                <p className="text-sm font-medium text-black">{product.volume}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">ABV</p>
                <p className="text-sm font-medium text-black">{product.abv}</p>
              </div>
              {product.origin && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Origin</p>
                  <p className="text-sm font-medium text-black">{product.origin}</p>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <ProductDetailActions product={product} />

            <div className="flex flex-col gap-2.5 mt-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon icon="solar:bag-check-outline" className="w-4.5 h-4.5 text-primary-normal shrink-0 mt-0.5" />
                Available for in-store pickup, usually ready within 30&ndash;60 minutes.
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon icon="solar:delivery-outline" className="w-4.5 h-4.5 text-primary-normal shrink-0 mt-0.5" />
                Local delivery available where legally permitted &mdash; see our{" "}
                <Link href="/pickup-delivery-policy" className="font-semibold text-primary-normal hover:opacity-80">
                  Pickup &amp; Delivery Policy
                </Link>
                .
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon icon="solar:shield-check-linear" className="w-4.5 h-4.5 text-primary-normal shrink-0 mt-0.5" />
                Must be 21+ with a valid government-issued photo ID at pickup or delivery.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="font-title text-xl sm:text-2xl font-bold text-black mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="font-title text-xl sm:text-2xl font-bold text-black mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((similar) => (
                <ProductCard key={similar.id} product={similar} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetailPage;
