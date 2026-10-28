import Link from "next/link";
import { Icon } from "@iconify/react";
import type { PublicSaleItem } from "@/redux/features/sale/saleApiSlice";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SaleCard from "./SaleCard";

export interface SaleSectionProps {
  items?: PublicSaleItem[];
  hideIfEmpty?: boolean;
  isDialog?: boolean;
  onItemClick?: () => void;
}

const SaleSection = ({
  items = [],
  hideIfEmpty = false,
  isDialog = false,
  onItemClick,
}: SaleSectionProps) => {
  if (items.length === 0) {
    if (hideIfEmpty) {
      return null;
    }
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#181512] via-[#241E17] to-[#181512] border-y border-[#E3B97D]/20 py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <Icon icon="solar:tag-price-bold-duotone" className="mx-auto h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-xl font-bold text-white">No Items Currently on Sale</h3>
          <p className="mt-1 text-sm text-gray-400">Check back soon for new discounts and weekly deals!</p>
        </div>
      </section>
    );
  }

  const content = (
    <Carousel
      opts={{ align: isDialog ? "center" : "start", loop: isDialog ? items.length > 2 : false }}
      className="w-full"
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
          isDialog ? "mb-5 pr-8" : "mb-8"
        )}
      >
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-normal/15 px-3 py-1 text-xs font-semibold text-primary-normal border border-primary-normal/30 mb-2">
            <Icon icon="solar:tag-bold-duotone" className="h-4 w-4" />
            {isDialog ? "Special Welcome Deals" : "Limited Time Deals"}
          </span>
          <h2
            className={cn(
              "font-title font-extrabold tracking-tight text-white",
              isDialog ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
            )}
          >
            Weekly Specials & Sales
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            Grab your favorite spirits, wines, and beers at special discounted prices.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/specials"
            onClick={onItemClick}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-normal hover:text-primary-hover transition-colors mr-2"
          >
            <span>View All</span>
            <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-9 w-9 sm:h-10 sm:w-10 border-[#E3B97D]/30 text-primary-normal hover:bg-primary-normal hover:text-black hover:border-primary-normal" />
            <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-9 w-9 sm:h-10 sm:w-10 border-[#E3B97D]/30 text-primary-normal hover:bg-primary-normal hover:text-black hover:border-primary-normal" />
          </div>
        </div>
      </div>

      <CarouselContent
        className={cn(
          isDialog
            ? "-ml-3 sm:-ml-4"
            : "-ml-4 sm:-ml-6"
        )}
      >
        {items.map((item) => (
          <CarouselItem
            key={`${item.product.id}-${item.variant.id}`}
            className={cn(
              isDialog
                ? "pl-3 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/2 xl:basis-1/2"
                : "pl-4 sm:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            )}
          >
            <SaleCard item={item} isDialog={isDialog} onItemClick={onItemClick} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );

  if (isDialog) {
    return <div className="relative w-full">{content}</div>;
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#181512] via-[#241E17] to-[#181512] border-y border-[#E3B97D]/20 py-16 text-white">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-normal/10 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {content}
      </div>
    </section>
  );
};

export default SaleSection;
