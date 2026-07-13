import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/index";

interface HomeCategory {
  id: number;
  name: string;
  categoryParam: string;
  image: string;
  className: string;
}

const homeCategories: HomeCategory[] = [
  { id: 1, name: "Wine", categoryParam: "Wine", image: "/category/wine.jpeg", className: "md:col-span-2" },
  { id: 2, name: "Spirits", categoryParam: "Spirits", image: "/category/spirits.jpeg", className: "col-span-1" },
  { id: 3, name: "Beer", categoryParam: "Beer", image: "/category/beer.jpeg", className: "col-span-1" },
  { id: 4, name: "Mixers & Extras", categoryParam: "Mixer", image: "/category/mixers.jpeg", className: "md:col-span-2" },
];

const Categories = () => {
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
          {homeCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.categoryParam}`}
              className={cn("group relative overflow-hidden rounded-2xl", category.className)}
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
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
