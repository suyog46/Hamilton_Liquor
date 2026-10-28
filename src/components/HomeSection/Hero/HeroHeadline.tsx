"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useAgeVerification } from "@/lib/context/AgeVerification";

export const HeroHeadline = () => {
  const { verified } = useAgeVerification();

  return (
    <h1 className="font-title text-4xl md:text-7xl xl:text-8xl font-bold text-white leading-tight w-full max-w-none md:whitespace-nowrap z-20">
      {verified ? (
        <>
          <TextGenerateEffect words="Crafted for the" className="inline" duration={0.5} />
          <br className="hidden md:block" />
          <TextGenerateEffect words="Connoisseur" className="inline" duration={0.8} />
        </>
      ) : (
        <>
          <span>Crafted for the</span>
          <br className="hidden md:block" />
          <span>Connoisseur</span>
        </>
      )}
    </h1>
  );
};

export default HeroHeadline;
