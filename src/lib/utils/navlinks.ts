export const navbarLinks = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

// These route through /wine, /spirits, /beer, /mixers-extras, which redirect to
// /shop?category=<slug> — the slug must match a category created in the admin panel.
export const footerShopLinks = [
  { name: "Shop All", href: "/shop" },
  { name: "Wine", href: "/wine" },
  { name: "Spirits", href: "/spirits" },
  { name: "Beer", href: "/beer" },
  { name: "Mixers & Extras", href: "/mixers-extras" },
];

export const footerCompanyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Location & Hours", href: "/location-hours" },
  { name: "Contact Us", href: "/contact" },
];

export const footerPolicyLinks = [
  { name: "Age Verification Policy", href: "/age-verification-policy" },
  { name: "Pickup & Delivery Policy", href: "/pickup-delivery-policy" },
];
