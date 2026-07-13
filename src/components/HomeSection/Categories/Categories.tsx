import Image from "next/image";
import Link from "next/link";

interface HomeCategory {
  name: string;
  slug: string;
  image: string;
}




const homeCategories: HomeCategory[] = [
  { name: "Wine", slug: "wine", image: "/category/wine.jpeg" },
  { name: "Spirits", slug: "spirits", image: "/category/spirits.jpeg" },
  { name: "Beer", slug: "beer", image: "/category/beer.jpeg" },
  { name: "Mixers & Extras", slug: "mixers-extras", image: "/category/mixers.jpeg" },
];

const Categories = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">Browse</span>
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-black">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {homeCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="group relative flex flex-col items-end justify-end h-40 sm:h-52 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="relative z-10 w-full p-4 text-sm sm:text-base font-semibold text-white text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
