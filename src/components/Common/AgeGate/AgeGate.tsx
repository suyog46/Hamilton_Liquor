"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { setAgeVerifiedCookie, siteConfig } from "@/lib/utils";

const AgeGate = ({ initiallyVerified }: { initiallyVerified: boolean }) => {
  const [open, setOpen] = useState(!initiallyVerified);
  const [declined, setDeclined] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    acceptButtonRef.current?.focus();

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleAccept = () => {
    setAgeVerifiedCookie();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl">
        {declined ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
              <Icon icon="solar:shield-cross-linear" className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="font-title text-lg font-bold text-black">Access Restricted</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {siteConfig.name} sells alcohol and is only available to visitors who are 21 years of age or older.
              You are not able to enter this site.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-lg text-sm w-full"
              onClick={() => setDeclined(false)}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-normal/10 border border-primary-normal/40">
              <Icon icon="mdi:bottle-wine" className="w-7 h-7 text-primary-normal" />
            </div>
            <h2 id="age-gate-title" className="font-title text-lg sm:text-xl font-bold text-black">
              Are You 21 or Older?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {siteConfig.name} sells alcohol. You must be 21 years of age or older to enter this site. Please
              confirm your age to continue.
            </p>

            <div className="flex flex-col gap-2 w-full mt-1">
              <Button
                ref={acceptButtonRef}
                type="button"
                className="h-11 rounded-lg bg-primary-normal text-black text-sm font-semibold hover:opacity-90 w-full"
                onClick={handleAccept}
              >
                Yes, I&apos;m 21 or Older
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg text-sm w-full"
                onClick={() => setDeclined(true)}
              >
                No, I&apos;m Not
              </Button>
            </div>

            <a
              href="/age-verification-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 underline underline-offset-2 hover:text-primary-normal transition-colors"
            >
              Read our Age Verification Policy
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeGate;
