import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import ProductDetailView from "@/components/Shop/ProductDetailView/ProductDetailView";
import { core } from "@/lib/api/core";
import type {
  Product,
  ProductResponse,
  PublicProductListItem,
  PublicProductListResponse,
} from "@/redux/features/product/productApiSlice";
import type { CategoryListResponse } from "@/redux/features/category/categoryApiSlice";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const RELATED_POOL_SIZE = 40;

const getProduct = async (id: string): Promise<Product | null> => {
  const res = await core(`products/${id}`);
  if (!res.ok) return null;
  const json: ProductResponse = await res.json();
  return json.data;
};

const getProductPool = async (): Promise<PublicProductListItem[]> => {
  const res = await core(`products?limit=${RELATED_POOL_SIZE}&sort_by=created_at&sort_order=desc`);
  if (!res.ok) return [];
  const json: PublicProductListResponse = await res.json();
  return json.data.items;
};

const getCategorySlug = async (categoryId: string): Promise<string | null> => {
  const res = await core(`categories?limit=100`);
  if (!res.ok) return null;
  const json: CategoryListResponse = await res.json();
  return json.data.items.find((category) => category.id === categoryId)?.slug ?? null;
};

export const generateMetadata = async ({ params }: ProductPageProps): Promise<Metadata> => {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Product Not Found | Hamilton Liquor Store" };
  }

  return {
    title: `${product.name} | Hamilton Liquor Store`,
    description:
      product.description ??
      `${product.name} — ${product.category.name} by ${product.brand.name}. Available for pickup at Hamilton Liquor Store in Baltimore, MD.`,
  };
};

const ProductDetailPage = async ({ params }: ProductPageProps) => {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const [pool, categorySlug] = await Promise.all([getProductPool(), getCategorySlug(product.category.id)]);

  const relatedProducts = pool
    .filter((p) => p.id !== product.id && p.category.id === product.category.id)
    .slice(0, 4);

  const relatedIds = relatedProducts.map((p) => p.id);
  const similarProducts = pool
    .filter((p) => p.id !== product.id && !relatedIds.includes(p.id) && p.brand.id === product.brand.id)
    .slice(0, 4);

  return (
    <>
      <ProductDetailView
        product={product}
        categoryHref={categorySlug ? `/shop?category=${categorySlug}` : "/shop"}
      />

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="font-title text-xl sm:text-2xl font-bold text-black mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
