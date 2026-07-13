"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils/index";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

interface CarouselContextValue {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel sub-components must be used within a <Carousel />");
  }
  return context;
};

const Carousel = ({
  opts,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { opts?: CarouselOptions }) => {
  const [carouselRef, api] = useEmblaCarousel({ align: "start", ...opts });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((emblaApi: NonNullable<CarouselApi>) => {
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  return (
    <CarouselContext.Provider value={{ carouselRef, api, canScrollPrev, canScrollNext, scrollPrev, scrollNext }}>
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

const CarouselContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn("flex -ml-4 sm:-ml-6", className)} {...props} />
    </div>
  );
};

const CarouselItem = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4 sm:basis-1/3 sm:pl-6 lg:basis-1/4", className)} {...props} />
);

const CarouselPrevious = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Previous slide"
      className={cn(
        "h-9 w-9 rounded-full border-secondary-normal/30 text-secondary-normal hover:bg-secondary-normal hover:text-white hover:border-secondary-normal disabled:opacity-30",
        className
      )}
      {...props}
    >
      <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
    </Button>
  );
};

const CarouselNext = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Next slide"
      className={cn(
        "h-9 w-9 rounded-full border-secondary-normal/30 text-secondary-normal hover:bg-secondary-normal hover:text-white hover:border-secondary-normal disabled:opacity-30",
        className
      )}
      {...props}
    >
      <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4" />
    </Button>
  );
};

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel };
