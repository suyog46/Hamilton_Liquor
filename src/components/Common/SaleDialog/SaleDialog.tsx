"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { setSaleDialogCookie } from "@/lib/utils";
import { useAgeVerification } from "@/lib/context/AgeVerification";
import SaleSection from "@/components/HomeSection/SaleSection/SaleSection";
import { useGetPublicSalesQuery } from "@/redux/features/sale/saleApiSlice";

interface SaleDialogProps {
  initiallyDismissed: boolean;
}

const SaleDialog = ({ initiallyDismissed }: SaleDialogProps) => {
  const { verified } = useAgeVerification();
  const [dismissed, setDismissed] = useState(initiallyDismissed);

  // Skip query if already dismissed or not age-verified
  const { data, isLoading } = useGetPublicSalesQuery(
    { page: 1, limit: 12 },
    { skip: dismissed || !verified },
  );

  const items = data?.data.items ?? [];
  const open = verified && !dismissed && !isLoading && items.length > 0;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleDismiss = () => {
    setSaleDialogCookie();
    setDismissed(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-dialog-title"
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-2xl sm:max-w-xl lg:max-w-2xl xl:max-w-3xl rounded-3xl bg-neutral-950 border border-primary-normal/40 p-5 sm:p-7 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close sale dialog"
          className="absolute top-4 right-4 z-20 rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Icon icon="solar:close-circle-bold" className="size-6 sm:size-7" />
        </button>

        <SaleSection
          isDialog
          hideIfEmpty
          onItemClick={handleDismiss}
        />
      </div>
    </div>
  );
};

export default SaleDialog;
