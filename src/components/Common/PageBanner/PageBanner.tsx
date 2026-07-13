import Breadcrumbs, { type BreadcrumbItem } from "@/components/Common/Breadcrumbs/Breadcrumbs";

interface PageBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const PageBanner = ({ eyebrow, title, subtitle, breadcrumbs = [] }: PageBannerProps) => {
  return (
    <section className="relative bg-black pt-28 pb-10 sm:pt-32 sm:pb-14 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(227,185,125,0.12)_0%,_rgba(0,0,0,0)_60%)]" />
      <div className="relative max-w-[1280px] mx-auto px-6 flex flex-col gap-4">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex flex-col gap-2">
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-normal">{eyebrow}</span>
          )}
          <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-sm sm:text-base text-white/60 max-w-xl">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
};

export default PageBanner;
