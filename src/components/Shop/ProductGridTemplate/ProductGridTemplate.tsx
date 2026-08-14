"use client";

import { Icon } from "@iconify/react";
import PageBanner from "@/components/Common/PageBanner/PageBanner";
import ProductCard from "@/components/Common/ProductCard/ProductCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicCategoriesQuery } from "@/redux/features/category/categoryApiSlice";
import { useGetPublicProductsQuery } from "@/redux/features/product/productApiSlice";
import { useGetPublicBrandsQuery } from "@/redux/features/brand/brandApiSlice";
import { useGetPublicCountriesQuery } from "@/redux/features/country/countryApiSlice";
import ShopFilters from "@/components/Shop/ShopFilters/ShopFilters";
import { useEffect, useMemo, useState } from "react";

interface ProductGridTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  initialCategory?: string;
  defaultSortBy?: "created_at" | "name" | "price";
  defaultSortOrder?: "asc" | "desc";
}

const PAGE_SIZE = 12;

type SortBy = "name" | "price" | "created_at";
type SortOrder = "asc" | "desc";

const ProductGridTemplate = ({
  eyebrow,
  title,
  subtitle,
  searchPlaceholder = "Search products…",
  initialCategory,
  defaultSortBy,
  defaultSortOrder,
}: ProductGridTemplateProps) => {
  const { data: categoryData } = useGetPublicCategoriesQuery({ limit: 50 });
  const categories = (categoryData?.data.items ?? []).filter((category) => category.is_active);
  const { data: brandData } = useGetPublicBrandsQuery({ limit: 100, sort_by: "name", sort_order: "asc" });
  const brands = (brandData?.data.items ?? []).filter((brand) => brand.is_active);
  const { data: countryData } = useGetPublicCountriesQuery({ limit: 100, sort_by: "name", sort_order: "asc" });
  const countries = (countryData?.data.items ?? []).filter((country) => country.is_active);

  const [categoryId, setCategoryId] = useState(initialCategory ?? "");
  const [brandId, setBrandId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>(defaultSortBy ?? "created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder ?? "desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [volumes, setVolumes] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!initialCategory || categoryId !== initialCategory || categories.length === 0) return;
    const category = categories.find((item) => item.id === initialCategory || item.slug === initialCategory);
    if (category) setCategoryId(category.slug);
  }, [initialCategory, categoryId, categories]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, brandId, countryId, debouncedSearch, sortBy, sortOrder, minPrice, maxPrice, volumes, inStockOnly]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      category: categoryId || undefined,
      brand: brandId || undefined,
      country: countryId || undefined,
      min_price: minPrice === "" ? undefined : Number(minPrice),
      max_price: maxPrice === "" ? undefined : Number(maxPrice),
      volume_ml: volumes.length > 0 ? volumes : undefined,
      in_stock: inStockOnly || undefined,
    }),
    [page, debouncedSearch, sortBy, sortOrder, categoryId, brandId, countryId, minPrice, maxPrice, volumes, inStockOnly]
  );

  const { data, isLoading, isFetching } = useGetPublicProductsQuery(queryParams);
  const products = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const showSkeleton = isLoading || (isFetching && products.length === 0);

  const clearFilters = () => {
    setCategoryId("");
    setBrandId("");
    setCountryId("");
    setMinPrice("");
    setMaxPrice("");
    setVolumes([]);
    setInStockOnly(false);
  };

  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} subtitle={subtitle} breadcrumbs={[{ name: title }]} />

      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Search bar */}
          <div className="relative mb-6">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 w-full rounded-xl pl-11 pr-4 text-sm border-gray-200 bg-gray-50"
            />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">
              <span className="text-gray-400">Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)} className="bg-transparent outline-none">
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="created_at">Created at</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700">
              <span className="text-gray-400">Order</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} className="bg-transparent outline-none">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>

          <div className="grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
            <ShopFilters
              categories={categories}
              brands={brands}
              countries={countries}
              categoryId={categoryId}
              brandId={brandId}
              countryId={countryId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              volumes={volumes}
              inStockOnly={inStockOnly}
              onCategoryChange={setCategoryId}
              onBrandChange={setBrandId}
              onCountryChange={setCountryId}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              onVolumeChange={(volume, checked) => setVolumes((current) => checked ? [...current, volume] : current.filter((item) => item !== volume))}
              onInStockChange={setInStockOnly}
              onClear={clearFilters}
            />

            <div className="min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">{pagination?.total_items ?? 0} products</p>
                <Badge className="hidden bg-gray-100 text-gray-600 sm:inline-flex">21+ Age Verified</Badge>
              </div>

              {showSkeleton ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-3xl" />)}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                  </div>
                  {pagination && pagination.total_pages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-4">
                      <button type="button" disabled={!pagination.has_previous} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">
                        <Icon icon="solar:alt-arrow-left-linear" className="w-3.5 h-3.5" /> Prev
                      </button>
                      <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.total_pages}</span>
                      <button type="button" disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">
                        Next <Icon icon="solar:alt-arrow-right-linear" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <Icon icon="solar:box-minimalistic-linear" className="w-10 h-10 text-gray-300" />
                  <p className="text-sm text-gray-400">No products match your filters — try adjusting them.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductGridTemplate;
