import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[600px] md:h-screen overflow-hidden bg-black lg:flex lg:flex-row">
      {/* Bottle image — full-bleed background on mobile, right-hand column on md+ */}
      <div className="absolute inset-0 lg:relative lg:order-2 lg:w-2/3 md:h-full">
        <Image
          src="/Home/hero.jpg"
          alt="Featured liquor bottle at Hamilton Liquor Store"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Mobile: dark scrim so the centered text stays legible over the photo */}
        <div className="absolute inset-0 bg-black/60 lg:hidden" />
        {/* Desktop/tablet: blend the image into the black text panel on its left */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-l from-black via-black/10 to-transparent" />
      </div>

      {/* Copy */}
      <div className="relative z-10 md:order-1 flex flex-col justify-center items-center md:items-start w-full min-h-[600px] md:min-h-0 md:w-1/2 lg:w-1/3 md:h-full px-6 md:ps-12 lg:ps-20 py-16 md:py-0 gap-6 md:gap-10">
        <div className="flex flex-col items-center md:items-start gap-4 md:gap-6 w-full text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal w-full">
            Hamilton Liquor Store
          </span>
          <h1 className="font-title text-4xl md:text-7xl xl:text-8xl font-bold text-white leading-tight w-full max-w-none md:whitespace-nowrap z-20">
            Crafted for the <br className="hidden md:block" />Connoisseur
          </h1>
          <p className="text-base md:text-lg text-white/70 w-full max-w-md">
            Discover a curated collection of premium spirits, distilled with
            precision and aged to perfection. Every bottle tells a story.
          </p>
          <a
            href="/shop"
            className="mt-2 px-8 py-3 w-full md:w-auto max-w-[250px] text-sm font-semibold rounded-lg bg-primary-normal text-black hover:opacity-90 transition text-center"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
