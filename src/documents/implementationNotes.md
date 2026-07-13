# Hamilton Liquor Store — Implementation Notes

Tracks what has actually been built against `websiteRequirement.md`, and the decisions made along the way. This is a design-phase build: layout, navigation, and information architecture are in place; most data is static/seed data, and backend logic (auth, payments, real cart persistence, CSV import, DB-backed admin actions) has not been implemented yet.

## 1. Storefront

### Navigation & footer
- `src/lib/utils/navlinks.ts` — `navbarLinks` (Home, Shop All, Wine, Spirits, Beer, Mixers & Extras, Specials, About, Contact) and grouped footer link sets (`footerShopLinks`, `footerCompanyLinks`, `footerPolicyLinks`). Only links to pages that actually exist.
- Trimmed scope: FAQ, My Account, Order History, Checkout, and the remaining policy pages (Refund, Fulfillment, Terms, Privacy) are **not** linked yet — left out of nav/footer on purpose so there are no dead links. Add them (and their pages) in a later pass.
- `src/lib/utils/siteConfig.ts` is the single source of truth for store name, address, phone, hours, Google rating/review count, and map/directions URLs. Update values here, not per-component.

### Pages added this session
`/specials`, `/cart`, `/about`, `/location-hours`, `/contact`, `/age-verification-policy`, `/pickup-delivery-policy`.

### Cart (`/cart`)
Design-level cart UI with seed line items, a local quantity stepper, pickup/delivery toggle, and a coupon input — all client-side component state, nothing persisted or wired to checkout. "Proceed to Checkout" is a static button (no checkout page exists yet).

### Product data (`src/lib/utils/products.ts`)
- Added required fields: `brand`, `image`, `inStock`.
- `ProductCard` now shows a real image, brand, a status badge (On Sale / Best Seller / Staff Pick / New), strikethrough original price, and an out-of-stock state.
- **Images are placeholders.** All product images currently cycle through `/public/Test/test_1.jpeg` … `test_6.jpeg`. Replace with real bottle photography named `/products/<id>.jpg` (e.g. `/products/p1.jpg`) and update `image:` per product when photos are available.

### Category images (home page)
`Categories.tsx` uses the real files already in `/public/category/`: `wine.jpeg`, `spirits.jpeg`, `beer.jpeg`, `mixers.jpeg`.

### Images still needed from the store
| Purpose | Path to add | Notes |
|---|---|---|
| About page storefront/interior photo | `/public/Home/about.jpg` | Currently a broken image placeholder until added |
| Real product photography | `/public/products/<id>.jpg` | Replaces the Test placeholders |

### Google Maps
`GoogleMapSection` (home) and `/location-hours` both use a no-API-key embed: `https://www.google.com/maps?q=<address>&output=embed`. Works out of the box; swap for a Places-API-based embed later if a Google API key is provisioned.

## 2. Age Verification Gate

- `src/components/Common/AgeGate/AgeGate.tsx`, mounted in `src/app/(site)/layout.tsx` — gates the **entire** `(site)` route group (every public page), not just the homepage, per requirement §11.
- **Uses 21+, not 18+.** The requirement doc and Maryland/U.S. alcohol law both specify 21. If 18+ was intentional for a specific reason, flag it and this can be changed in one place (`AgeGate.tsx` copy).
- Verification state is stored in a cookie (`hls_age_verified`, 1 year expiry) rather than localStorage — chosen because it's readable server-side. The `(site)` layout is an async server component that reads the cookie via `next/headers` and passes `initiallyVerified` into `AgeGate`, so the gate is rendered in the initial server HTML with no flash of unblocked content before hydration.
- The gate is a plain fixed-position overlay (not a portal-based dialog) specifically so it appears in the raw SSR HTML — a portaled dialog only mounts client-side and would show the site unblocked for a moment on first load.
- Non-dismissable: no close button, no outside-click or Escape handling. Declining ("No, I'm not") shows a blocking "Access Restricted" message with a "Go Back" option; it does not redirect off-site.
- Links out to `/age-verification-policy` (opens in a new tab so the gate state isn't lost).
- No server-side route protection yet — the cookie is not currently checked in middleware, so a user could theoretically hit an API route directly once one exists. Fine for a static design phase; revisit if/when real checkout logic is added.

## 3. Admin Dashboard (`src/app/admin`)

Structure: `AdminSidebar` (grouped nav) + `AdminNavbar` (search, notifications, account menu) + `AdminFooter` (new) inside `SidebarProvider` / `SidebarInset`.

Nav groups (`src/lib/utils/adminlinks.ts`):
- **Overview** — Dashboard, Reports
- **Catalog** — Products, Categories
- **Sales** — Orders, Customers, Coupons
- **Marketing** — Homepage Banners, SMS & Email Signups
- **Store Operations** — Store Hours, Delivery Zones
- **Secondary (footer of sidebar)** — Settings, Help & Support

Pages built, all with realistic seed data and UI-only actions (edit/delete/status buttons are present but not wired to a backend):
- `/admin` — stat cards, quick links, recent orders table
- `/admin/products` — catalog table (image, brand, category, price/sale price, stock badge, tags), Add Product / Import CSV buttons (no-op)
- `/admin/categories` — the 4 top-level categories with subcategory chips pulled from requirement §6
- `/admin/orders` — table covering all 8 required order statuses (New → Refunded), per-row status/print/cancel dropdown
- `/admin/customers` — contact info, order count, spend, marketing opt-in status
- `/admin/coupons` — coupon list (percent/fixed, usage, status, expiry) + Create Coupon button
- `/admin/banners` — homepage hero + promo banner manager (active/inactive)
- `/admin/marketing` — SMS/email signup list + a campaign composer (send button is a no-op)
- `/admin/store-hours` — editable weekly hours (seeded from `siteConfig.hours`) + holiday note field
- `/admin/delivery-zones` — radius, ZIP codes, fee/minimum, ID/age handoff requirements; delivery is flagged "Disabled — Pending Approval" per requirement §10/§12
- `/admin/reports` — 30-day stat cards + top-selling products table
- `/admin/settings` — store info form, SpotOn status card ("Pending Verification" — integration still needs to be confirmed per requirement §12), admin access
- `/admin/support` — static help topics

**Not yet built:** actual auth/role-based access control on `/admin` (currently unprotected — `src/app/login` exists but isn't wired to gate the admin routes), CSV import logic, any persistence (everything resets on reload since there's no database yet).

## 4. Open items / next phases

From `websiteRequirement.md`, still outstanding:
- Backend + database (products, orders, customers, coupons are all hardcoded arrays right now)
- SpotOn payment integration (needs merchant-account verification first, per requirement §12)
- Real checkout flow (`/checkout` page doesn't exist yet — Cart's "Proceed to Checkout" is inert)
- My Account / Order History pages
- Remaining policy pages: Refund, Fulfillment, Terms & Conditions, Privacy Policy
- FAQ, Events/Tastings (optional)
- Admin auth / role-based access
- CSV product import
- SEO: schema markup, sitemap, robots.txt, Search Console/Analytics wiring (basic `<title>`/`<meta description>` only so far)
