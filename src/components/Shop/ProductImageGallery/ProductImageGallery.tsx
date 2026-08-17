"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import type { MediaLatestRef } from "@/redux/features/product/productApiSlice";

interface ProductImageGalleryProps {
  media: MediaLatestRef[];
  alt: string;
  inStock: boolean;
  className?: string;
}

// Swipe distance (px) past which a touch gesture counts as a slide instead
// of a tap/scroll.
const SWIPE_THRESHOLD = 40;

const ProductImageGallery = ({ media, alt, inStock, className }: ProductImageGalleryProps) => {
  const images = [...media].sort((a, b) => a.display_order - b.display_order).map((item) => item.media);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const hasMultiple = images.length > 1;
  const active = images[activeIndex] ?? null;

  const goTo = (index: number) => setActiveIndex((index + images.length) % images.length);
  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD) goNext();
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className="relative h-80 sm:h-[28rem] rounded-2xl overflow-hidden bg-gray-50"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        {active?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={alt}
            className={cn("absolute inset-0 h-full w-full object-cover", !inStock && "opacity-50 grayscale")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <Icon icon="solar:bottle-linear" className="w-16 h-16" />
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm transition-colors hover:bg-white"
            >
              <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm transition-colors hover:bg-white"
            >
              <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}

        {!inStock && (
          <span className="absolute inset-x-0 bottom-0 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white bg-black/80">
            Out of Stock
          </span>
        )}
      </div>

      {hasMultiple && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => goTo(index)}
              className={cn(
                "relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-50 transition-colors",
                index === activeIndex ? "border-primary-normal ring-1 ring-primary-normal" : "border-gray-200 hover:border-gray-300"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
