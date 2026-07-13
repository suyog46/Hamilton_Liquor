"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";

const AosProvider = () => {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 80,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [pathname]);

  return null;
};

export default AosProvider;
