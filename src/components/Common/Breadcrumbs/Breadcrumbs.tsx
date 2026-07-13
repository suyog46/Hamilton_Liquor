import Link from "next/link";
import { Icon } from "@iconify/react";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-white/50">
      <Link href="/" className="hover:text-primary-normal transition-colors">
        Home
      </Link>
      {items.map((item) => (
        <span key={item.name} className="flex items-center gap-1.5">
          <Icon icon="material-symbols:chevron-right" className="w-3.5 h-3.5 text-white/30" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-normal transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="text-primary-normal">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
