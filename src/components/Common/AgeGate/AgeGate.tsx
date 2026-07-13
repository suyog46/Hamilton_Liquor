"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { setAgeVerifiedCookie, siteConfig } from "@/lib/utils";
import { useAgeVerification } from "@/lib/context/AgeVerification";

const AgeGate = ({ initiallyVerified }: { initiallyVerified: boolean }) => {
  const [open, setOpen] = useState(!initiallyVerified);
  const [declined, setDeclined] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const { markVerified } = useAgeVerification();

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
    markVerified();
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
      <div className="w-full max-w-md rounded-2xl bg-black border  border-primary-normal p-6 sm:p-8 text-center shadow-2xl">
        {declined ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
              <Icon icon="solar:shield-cross-linear" className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="font-title text-lg font-bold text-primary-normal">Access Restricted</h2>
            <p className="text-sm text-white leading-relaxed">
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
          <div className="flex flex-col items-center gap-4 ">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-normal/10 border border-primary-normal/40">
              <Icon icon="mdi:bottle-wine" className="w-7 h-7 text-white" />
            </div>
            <h2 id="age-gate-title" className="font-title  text-lg sm:text-xl font-bold text-primary-normal">
              Are You 21 or Older?
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {siteConfig.name} sells alcohol. You must be 21 years of age or older to enter this site. Please
              confirm your age to continue.
            </p>

            <div className="flex flex-col gap-2 w-full mt-1">
              <Button
                ref={acceptButtonRef}
                type="button"
                className="h-11 rounded-lg border border-primary-normal text-primary-normal text-sm font-semibold hover:bg-primary-normal hover:text-white w-full cursor-pointer"
                onClick={handleAccept}
              >
                Yes, I&apos;m 21 or Older
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border border-primary-normal text-primary-normal text-sm font-semibold hover:bg-primary-normal hover:text-white w-full cursor-pointer"
                onClick={() => setDeclined(true)}
              >
                No, I&apos;m Not
              </Button>
            </div>

            <a
              href="/age-verification-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-normal underline underline-offset-2 hover:text-primary-normal/80 transition-colors"
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
