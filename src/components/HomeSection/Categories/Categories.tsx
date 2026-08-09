"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/index";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublicCategoriesQuery } from "@/redux/features/category/categoryApiSlice";

// Cycled to reproduce the original 2-1-1-2 masonry rhythm for any item count.
const spanPattern = ["md:col-span-2", "col-span-1", "col-span-1", "md:col-span-2"];

const Categories = () => {
  const { data, isLoading, isFetching } = useGetPublicCategoriesQuery({ limit: 4 });
  const categories = (data?.data.items ?? []).filter((category) => category.is_active);
  const showSkeleton = isLoading || (isFetching && categories.length === 0);

  if (!showSkeleton && categories.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-2 mb-10" data-aos="fade-up">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Browse</span>
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">Shop by Category</h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] md:auto-rows-[280px] gap-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {showSkeleton
            ? spanPattern.map((span, i) => (
                <Skeleton key={i} className={cn("h-full w-full rounded-2xl", span)} />
              ))
            : categories.map((category, i) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-gray-100",
                    spanPattern[i % spanPattern.length]
                  )}
                >
                  {category.media?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.media.url}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <p className="font-title text-white text-2xl md:text-3xl font-bold">{category.name}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-normal opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      Shop {category.name} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
