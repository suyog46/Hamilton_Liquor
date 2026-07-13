export interface AdminNavItem {
  name: string;
  href: string;
  icon: string;
}

export const adminNavOverview: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin", icon: "solar:widget-5-linear" },
  { name: "Reports", href: "/admin/reports", icon: "solar:chart-2-linear" },
];

export const adminNavCatalog: AdminNavItem[] = [
  { name: "Products", href: "/admin/products", icon: "solar:box-linear" },
  { name: "Categories", href: "/admin/categories", icon: "solar:folder-linear" },
];

export const adminNavSales: AdminNavItem[] = [
  { name: "Orders", href: "/admin/orders", icon: "solar:bag-check-linear" },
  { name: "Customers", href: "/admin/customers", icon: "solar:users-group-rounded-linear" },
  { name: "Coupons", href: "/admin/coupons", icon: "solar:tag-price-linear" },
];

export const adminNavMarketing: AdminNavItem[] = [
  { name: "Homepage Banners", href: "/admin/banners", icon: "solar:gallery-wide-linear" },
  { name: "SMS & Email Signups", href: "/admin/marketing", icon: "solar:letter-linear" },
];

export const adminNavStore: AdminNavItem[] = [
  { name: "Store Hours", href: "/admin/store-hours", icon: "solar:clock-circle-linear" },
  { name: "Delivery Zones", href: "/admin/delivery-zones", icon: "solar:map-point-linear" },
];

export const adminNavSecondary: AdminNavItem[] = [
  { name: "Settings", href: "/admin/settings", icon: "solar:settings-linear" },
  { name: "Help & Support", href: "/admin/support", icon: "solar:question-circle-linear" },
];
