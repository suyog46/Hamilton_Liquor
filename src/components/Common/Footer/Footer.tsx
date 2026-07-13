import { footerCompanyLinks, footerPolicyLinks, footerShopLinks, siteConfig } from "@/lib/utils";
import { Icon } from "@iconify/react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-black text-white/70">
      <div className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <span className="font-title text-2xl font-bold text-primary-normal">Hamilton Liquor</span>
          <p className="text-sm leading-relaxed max-w-xs">
            {siteConfig.name} — Baltimore&apos;s trusted neighborhood spot for wine, spirits, beer &amp; more.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <a
              href={siteConfig.social.facebook}
              aria-label="Facebook"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary-normal hover:text-black transition-colors"
            >
              <Icon icon="mdi:facebook" className="w-4 h-4" />
            </a>
            <a
              href={siteConfig.social.instagram}
              aria-label="Instagram"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary-normal hover:text-black transition-colors"
            >
              <Icon icon="mdi:instagram" className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Shop</span>
          {footerShopLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm hover:text-primary-normal transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Company</span>
          {footerCompanyLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm hover:text-primary-normal transition-colors">
              {link.name}
            </Link>
          ))}
          {footerPolicyLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm hover:text-primary-normal transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Get in Touch</span>
          <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-sm hover:text-primary-normal transition-colors">
            <Icon icon="solar:phone-linear" className="w-4 h-4 shrink-0" />
            {siteConfig.phone}
          </a>
          <span className="flex items-start gap-2 text-sm">
            <Icon icon="solar:map-point-linear" className="w-4 h-4 shrink-0 mt-0.5" />
            {siteConfig.address.full}
          </span>
          <a
            href={siteConfig.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-primary-normal transition-colors"
          >
            <Icon icon="solar:routing-2-linear" className="w-4 h-4 shrink-0" />
            Get Directions
          </a>
          <p className="text-sm mt-2">Must be 21+ to purchase. Valid ID required. Drink responsibly.</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-6 text-xs text-white/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
          <span>{siteConfig.holidayNote}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
