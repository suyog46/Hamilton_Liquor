"use client";

import { cn, navbarLinks, siteConfig } from "@/lib/utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NavbarClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const nav = document.getElementById("main-navbar");
    const threshold = nav?.offsetHeight ?? 80;
    const handleScroll = () => setIsScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = isScrolled || isOpen;

  return (
    <header
      id="main-navbar"
      className={cn(
        "fixed top-0 sm:top-9 left-0 z-50 w-full transition-all duration-300 ease-in-out",
        isSolid ? "bg-white shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-6 h-16 md:h-20">
        <Link href="/" className="font-title text-lg sm:text-xl font-bold leading-tight shrink-0 text-primary-normal">
          Hamilton Liquor
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navbarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-normal hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <Link
            href="/shop"
            aria-label="Search products"
            className="inline-flex items-center justify-center text-primary-normal hover:opacity-80 transition-opacity"
          >
            <Icon icon="solar:magnifer-linear" className="w-5 h-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative inline-flex items-center justify-center text-primary-normal hover:opacity-80 transition-opacity"
          >
            <Icon icon="solar:cart-large-minimalistic-linear" className="w-6 h-6" />
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <Link
            href="/cart"
            aria-label="View cart"
            className="inline-flex items-center justify-center p-2 text-primary-normal"
          >
            <Icon icon="solar:cart-large-minimalistic-linear" className="w-6 h-6" />
          </Link>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center p-2 text-primary-normal"
          >
            <Icon icon={isOpen ? "material-symbols:close" : "material-symbols:menu"} className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-6 py-4 flex flex-col gap-4">
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-primary-normal"
            >
              <Icon icon="solar:magnifer-linear" className="w-4 h-4" />
              Search products
            </Link>
            {navbarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-black"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Store info — mobile only, since the top bar is hidden below sm */}
          <div className="px-6 py-4 flex flex-col gap-2 border-t border-gray-100 bg-gray-50">
            <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-sm font-medium text-black">
              <Icon icon="solar:phone-linear" className="w-4 h-4 text-primary-normal" />
              {siteConfig.phone}
            </a>
            <span className="flex items-center gap-2 text-xs text-gray-600">
              <Icon icon="solar:map-point-linear" className="w-4 h-4 text-primary-normal shrink-0" />
              {siteConfig.address.full}
            </span>
            <span className="flex items-center gap-2 text-xs text-gray-600">
              <Icon icon="solar:clock-circle-linear" className="w-4 h-4 text-primary-normal shrink-0" />
              Mon&ndash;Thu 9am&ndash;10pm &middot; Fri&ndash;Sat 9am&ndash;11pm &middot; Sun Closed
            </span>
            <a
              href={siteConfig.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-xs font-semibold w-fit"
            >
              <Icon icon="solar:routing-2-linear" className="w-3.5 h-3.5" />
              Get Directions
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarClient;
