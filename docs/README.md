# Hamilton Liquor Store — Test Case Catalogue

This document is the master manual test suite for the Hamilton Liquor Store web application. It covers the public storefront, guest shopping, authenticated customer flows, checkout and order management, and the admin console.

> Status note: some admin screens currently contain static/demo UI. Those cases are marked **Planned** and should not block a release until the corresponding feature is connected to the API.

## 1. How to use this document

Run the applicable cases for each release. Record the tester, environment, date, result (`Pass`, `Fail`, `Blocked`, or `Not run`), evidence, and defect link in the test run/reporting tool.

### Tag convention

Each case has searchable tags in the form `@tag`:

- Feature: `@auth`, `@catalog`, `@product`, `@cart`, `@checkout`, `@order`, `@address`, `@inventory`, `@store`, `@admin`, `@policy`, `@navigation`, `@age-gate`
- Actor: `@guest`, `@customer`, `@admin`
- Test type: `@smoke`, `@regression`, `@negative`, `@security`, `@accessibility`, `@responsive`, `@integration`
- Fulfillment: `@pickup`, `@delivery`, `@payment`

### Priority

- **P0:** revenue, authentication, authorization, payment, or data-integrity critical
- **P1:** core user journey or important administration workflow
- **P2:** secondary behavior, presentation, or convenience

### Standard case format

| Field | Meaning |
|---|---|
| ID | Stable identifier used in reports and automation |
| Role | Guest, Customer, Admin, or All |
| Pri | P0, P1, or P2 |
| Preconditions | Required account, data, or system state |
| Steps | Numbered user actions |
| Expected result | Observable pass criteria |

## 2. Test environment and data

### Required accounts

1. Verified customer with no addresses or orders.
2. Verified customer with a default address, a second address, and order history.
3. Unverified customer.
4. Active admin account.
5. Disabled/deleted account when supported by the API.

Never use production payment credentials or real customer information. Use the SpotOn sandbox/test environment and a payment method that supports success, decline, cancellation, and timeout scenarios.

### Required catalogue data

- Active, in-stock products in Wine, Spirits, Beer, and Mixers & Extras.
- Product with multiple variants, images, volume, ABV, price, sale price, category, and brand.
- Product with one unit remaining; out-of-stock product; inactive product.
- Product/category/brand names containing punctuation and long text.
- Pickup and delivery orders in each supported fulfillment status.

### Common setup

- Test desktop and mobile viewport sizes.
- Test a clean browser session and a session with existing cookies/local storage.
- Confirm frontend and API environments point to the same test dataset.
- Capture request/response evidence for checkout, authorization, inventory, or order failures; never attach tokens or secrets.

## 3. Access and role matrix

| Area/action | Guest | Logged-in customer | Admin |
|---|---:|---:|---:|
| Public pages and catalogue | Allowed | Allowed | Allowed |
| Guest cart | Allowed (local browser state) | Not used | Not used |
| Server cart | No | Own cart | Own cart if shopping as a user |
| Checkout | Redirect to login | Allowed | Depends on customer-cart state |
| Profile, addresses, own orders | Redirect/login required | Own data only | Own customer data only unless using admin orders |
| `/admin/*` | Redirect to login | Redirect to home | Allowed |
| Admin catalogue, inventory, orders, store settings | No | No | Allowed |

## 4. Authentication and authorization

### AUTH-001 — Register a valid customer

**Tags:** `@auth @guest @smoke` · **Priority:** P0

**Preconditions:** Email is not registered.  
**Steps:** 1. Open `/register`. 2. Enter valid required details and a compliant password. 3. Submit once.  
**Expected:** One account is created; a clear verification instruction/success state is shown; credentials or tokens are not exposed in the URL or UI.

### AUTH-002 — Registration validation and duplicate email

**Tags:** `@auth @guest @negative` · **Priority:** P1

**Steps:** 1. Submit empty and malformed fields. 2. Try mismatched/weak passwords. 3. Try an existing email.  
**Expected:** Submission is blocked for client-invalid data; server errors are readable and associated with the correct input; duplicate registration does not create another account.

### AUTH-003 — Verify email and reject invalid links

**Tags:** `@auth @guest @integration` · **Priority:** P0

**Steps:** 1. Open a valid verification link. 2. Confirm success. 3. Reopen the used link. 4. Try missing, altered, and expired tokens.  
**Expected:** The valid account becomes verified once; reused/invalid/expired links show a safe recovery message and never verify the wrong account.

### AUTH-004 — Resend verification

**Tags:** `@auth @guest @negative` · **Priority:** P1

**Steps:** Request a new link for an unverified account, then repeat rapidly and try an unknown/already-verified email.  
**Expected:** A new message is requested without account enumeration; rate-limit feedback is graceful; only the newest policy-supported token works.

### AUTH-005 — Customer login and redirect preservation

**Tags:** `@auth @customer @smoke` · **Priority:** P0

**Steps:** 1. Visit `/checkout` while signed out. 2. Confirm redirect to `/login?redirect=/checkout`. 3. Log in with valid verified credentials.  
**Expected:** Authentication succeeds, secure session cookies are set, and the user returns to checkout without an open redirect to another origin.

### AUTH-006 — Login failures

**Tags:** `@auth @guest @negative @security` · **Priority:** P0

**Steps:** Try an incorrect password, unknown email, unverified account, empty fields, repeated attempts, and script/SQL-like input.  
**Expected:** Access is denied; errors do not reveal whether an account exists; input renders as text; throttling/API errors do not crash the page.

### AUTH-007 — Forgot and reset password

**Tags:** `@auth @guest @integration` · **Priority:** P0

**Steps:** 1. Request reset for a registered email. 2. Open the valid link. 3. test weak/mismatched then valid passwords. 4. Log in with old and new passwords.  
**Expected:** Response avoids account enumeration; validation works; token is single-use; old password fails and new password succeeds.

### AUTH-008 — Logout and account deletion

**Tags:** `@auth @customer @admin @security` · **Priority:** P0

**Steps:** 1. Log out and revisit protected pages with Back/direct URL. 2. Separately confirm account deletion from settings.  
**Expected:** Tokens and cached private API data are cleared on logout. Deletion requires confirmation, removes access, logs the user out, and cannot be triggered accidentally.

### AUTH-009 — Role-based admin protection

**Tags:** `@auth @admin @customer @guest @security @smoke` · **Priority:** P0

**Steps:** Open `/admin` and several deep admin URLs as guest, customer, and admin; also call admin endpoints without admin credentials.  
**Expected:** Guest goes to login, customer goes to `/`, admin is allowed; direct API requests return 401/403 and cause no mutation.

### AUTH-010 — Token refresh and expired session

**Tags:** `@auth @customer @admin @security` · **Priority:** P0

**Steps:** Test a missing/expired access token with a valid refresh token, then an invalid/expired refresh token.  
**Expected:** Valid refresh rotates/restores the session without losing the current task. Failed refresh clears auth cookies and returns the user to login; no redirect loop occurs.

## 5. Public storefront, navigation, and age gate

### PUB-001 — First-visit age verification

**Tags:** `@age-gate @guest @smoke` · **Priority:** P0

**Steps:** In a clean browser open the site, reject being 21+, then repeat and confirm being 21+. Reopen and test a new session/device.  
**Expected:** Store content cannot be used before confirmation; rejection follows the defined safe exit behavior; acceptance persists only for the intended duration.

### PUB-002 — Header, footer, and category navigation

**Tags:** `@navigation @guest @customer @responsive` · **Priority:** P1

**Steps:** Use desktop and mobile navigation for Home, Shop All, About, Contact, Wine, Spirits, Beer, Mixers & Extras, policy pages, logo, cart, and account links.  
**Expected:** Each destination opens correctly; category routes resolve to the matching filtered shop; mobile menus close after navigation; focus and active states are visible.

### PUB-003 — Homepage content and calls to action

**Tags:** `@store @catalog @guest @smoke` · **Priority:** P1

**Steps:** Review hero, categories, featured/new products, pickup/delivery information, newsletter, reviews, map, store details, and CTA links.  
**Expected:** Sections load without layout shift or broken images; CTAs target the correct page/filter; empty or failed API sections have a usable fallback.

### PUB-004 — Store information consistency

**Tags:** `@store @guest @integration` · **Priority:** P1

**Steps:** Compare phone, email, address, hours, social links, map, click-to-call, and directions across top bar, footer, homepage, and Location & Hours.  
**Expected:** Published admin data is consistent; phone/email links use valid schemes; map/directions point to the configured location; closed/holiday messaging is clear.

### PUB-005 — About, contact, and policy pages

**Tags:** `@policy @guest @navigation` · **Priority:** P2

**Steps:** Open About, Contact, Age Verification Policy, and Pickup & Delivery Policy; exercise all links and the contact form if enabled.  
**Expected:** Content is readable and current; required fields validate; repeat submission is prevented; success/failure is clear; external links are safe.

## 6. Catalogue and product discovery

### CAT-001 — Product list loading, empty, and failure states

**Tags:** `@catalog @guest @customer @smoke` · **Priority:** P0

**Steps:** Open `/shop` with normal results, no matching results, slow response, and API failure.  
**Expected:** Cards show correct image/name/variant/price/stock; skeleton appears while loading; empty/error states are distinct and retry/navigation remains possible.

### CAT-002 — Search, category, brand, sort, and combined filters

**Tags:** `@catalog @guest @regression` · **Priority:** P1

**Steps:** Apply each control individually and in combination; clear filters; navigate browser Back/Forward; test no-result and special-character searches.  
**Expected:** Results and count match all criteria; query state is reproducible from the URL where supported; clearing restores the catalogue; input is safely encoded.

### CAT-003 — Pagination and responsive product grid

**Tags:** `@catalog @guest @responsive` · **Priority:** P1

**Steps:** Navigate first/middle/last pages, change filters on a later page, and resize/mobile-scroll.  
**Expected:** No missing/duplicate products; invalid pages recover safely; filtering resets/clamps pagination; controls and cards do not overflow.

### PROD-001 — Product detail and variants

**Tags:** `@product @guest @customer @smoke` · **Priority:** P0

**Steps:** Open a product; inspect images; select each variant; check price, volume, ABV, stock, brand/category, and breadcrumb.  
**Expected:** Data matches the selected variant and admin/API source; image fallback works; selection controls are keyboard usable; invalid product IDs show a safe not-found state.

### PROD-002 — Stock and inactive product visibility

**Tags:** `@product @inventory @guest @negative` · **Priority:** P0

**Steps:** Visit out-of-stock, inactive/deleted, and one-unit variants directly and through lists.  
**Expected:** Inactive/deleted items cannot be purchased; unavailable variants are clearly disabled; quantity never exceeds available inventory.

## 7. Cart

### CART-001 — Guest add, update, remove, and persistence

**Tags:** `@cart @guest @smoke` · **Priority:** P0

**Steps:** Add variants from list/detail, add the same variant twice, change quantities, refresh, open a new tab, remove all items.  
**Expected:** Guest cart persists in browser storage; duplicate behavior is deterministic; badge, lines, subtotal, and stock caps remain correct.

### CART-002 — Authenticated server cart

**Tags:** `@cart @customer @smoke @integration` · **Priority:** P0

**Steps:** Perform add/update/remove actions, refresh, and open the account on another browser/device.  
**Expected:** Server cart persists and is account-specific; UI updates once per action; failed updates restore the prior quantity and show an error.

### CART-003 — Guest login cart transition

**Tags:** `@cart @auth @guest @customer @integration` · **Priority:** P0

**Steps:** Build a guest cart, log in, then inspect cart contents and badge.  
**Expected:** The implemented merge/replace policy is applied consistently without duplicate or lost lines and is communicated if user choice is required.

### CART-004 — Price and inventory changes after carting

**Tags:** `@cart @inventory @customer @negative` · **Priority:** P0

**Steps:** While an item is in cart, change its price, reduce stock below requested quantity, or deactivate it; reload and attempt checkout.  
**Expected:** Current server price/stock wins; affected line is clearly identified; invalid quantities are corrected or blocked; checkout cannot use stale client totals.

### CART-005 — Cart API failure and rapid actions

**Tags:** `@cart @customer @negative` · **Priority:** P1

**Steps:** Simulate timeout/500 and rapidly click add, increment, decrement, and remove.  
**Expected:** Controls prevent unintended duplicate requests; optimistic UI rolls back on failure; counts never become negative or exceed stock.

## 8. Customer profile and addresses

### PROF-001 — Protected profile and customer identity

**Tags:** `@auth @customer @guest` · **Priority:** P1

**Steps:** Open `/my-profile` as guest and customer.  
**Expected:** Guest is redirected to login with the correct return path; customer sees only their own name, email, and addresses; loading/error states do not leak another user.

### ADDR-001 — Create address validation

**Tags:** `@address @customer @smoke` · **Priority:** P0

**Steps:** Create an address with valid data; repeat with required fields missing, malformed postal/state values, excessive lengths, and leading/trailing spaces.  
**Expected:** Valid normalized data saves once; invalid input is rejected with field-level feedback; another customer cannot see it.

### ADDR-002 — Edit, default, and delete address

**Tags:** `@address @customer @regression` · **Priority:** P0

**Steps:** Edit each field, set a second address as default, delete a non-default address, then attempt to delete the default/last address.  
**Expected:** Changes persist; exactly one default exists; delete confirmation and business rules are enforced; checkout selection updates accordingly.

### ADDR-003 — Address ownership security

**Tags:** `@address @customer @security @negative` · **Priority:** P0

**Steps:** Use customer A to request/update/delete customer B's address ID through the API.  
**Expected:** Every operation returns 403/404, reveals no private address data, and leaves customer B's data unchanged.

## 9. Checkout and payment

### CHK-001 — Checkout access and empty cart

**Tags:** `@checkout @guest @customer @smoke` · **Priority:** P0

**Steps:** Open checkout as guest, as a customer with an empty cart, and with a populated cart.  
**Expected:** Guest goes to login; empty cart shows Continue Shopping; populated cart displays accurate lines/subtotal and fulfillment options.

### CHK-002 — Pickup checkout

**Tags:** `@checkout @customer @pickup @payment @smoke` · **Priority:** P0

**Steps:** Select Pickup, choose an available time at least one hour ahead, review totals, submit once, and complete sandbox payment.  
**Expected:** Request contains pickup schedule and no delivery address; one order is created; user is sent only to the trusted checkout URL; successful return shows the correct order.

### CHK-003 — Delivery checkout

**Tags:** `@checkout @customer @delivery @payment @smoke` · **Priority:** P0

**Steps:** Select Delivery, choose/default/change an address, choose a time, enter handoff instructions, submit, and pay.  
**Expected:** Three-step flow validates each step; request contains delivery address/schedule/instructions; fee and total are accurate; order snapshots the delivery address.

### CHK-004 — Time-slot rules

**Tags:** `@checkout @pickup @delivery @negative` · **Priority:** P0

**Steps:** Inspect today and next seven days, Sunday, closing times, Friday/Saturday hours, browser near midnight, and a different timezone; submit a stale/past slot.  
**Expected:** Only valid future store-hour slots appear; Sunday is excluded; server rejects stale/out-of-policy times with actionable feedback.

### CHK-005 — Required delivery address and instructions safety

**Tags:** `@checkout @customer @delivery @negative @security` · **Priority:** P0

**Steps:** Continue delivery without an address; use a deleted/out-of-zone/another user's address; enter very long text and markup in instructions.  
**Expected:** Invalid address blocks checkout; ownership/zone rules are server-enforced; text is limited and later rendered without executing markup.

### CHK-006 — Payment decline, cancel, timeout, and retry

**Tags:** `@checkout @payment @customer @negative` · **Priority:** P0

**Steps:** Trigger each sandbox outcome, use Back/refresh, and retry once after failure.  
**Expected:** No false success; cart/order state follows the documented policy; retry cannot double-charge or create unintended duplicate orders; user receives a recoverable status.

### CHK-007 — Double submission and price tampering

**Tags:** `@checkout @payment @security @negative` · **Priority:** P0

**Steps:** Double-click submit, replay the request, alter client totals/prices/variant IDs/quantity, and submit an out-of-stock item.  
**Expected:** Server calculates totals and validates stock; duplicate/replayed requests are idempotent or safely rejected; no oversell or duplicate charge occurs.

### CHK-008 — Payment success return

**Tags:** `@checkout @order @payment @customer` · **Priority:** P0

**Steps:** Return from a successful, pending, failed, and forged payment redirect; refresh the success page.  
**Expected:** Status is verified server-side, not trusted from query parameters; displayed ID/items/amount match the order; refresh is safe; cart clears only under the intended policy.

## 10. Customer orders

### ORD-001 — Order history

**Tags:** `@order @customer @smoke` · **Priority:** P0

**Steps:** Open `/order` with no orders and with multiple pages of pickup/delivery orders.  
**Expected:** Empty/loading/error states work; newest ordering and pagination are correct; amount, status, method, and dates match API data.

### ORD-002 — Order details

**Tags:** `@order @customer @regression` · **Priority:** P0

**Steps:** Open pickup and delivery details across statuses.  
**Expected:** Items, unit/line totals, subtotal, fee, total, payment, schedule, address (delivery only), instructions, and event timeline are accurate.

### ORD-003 — Order ownership security

**Tags:** `@order @customer @security @negative` · **Priority:** P0

**Steps:** As customer A, open/call customer B's order ID and try sequential/random IDs.  
**Expected:** Access returns 403/404 without confirming existence or exposing customer/payment/address data.

## 11. Admin catalogue and media

### ADM-CAT-001 — Product create and validation

**Tags:** `@admin @catalog @product @smoke` · **Priority:** P0

**Steps:** Create a product with valid name, description, category, brand, status, and required media; then test missing/invalid/duplicate data.  
**Expected:** Valid product saves once and appears consistently; invalid submissions identify fields and create no partial record.

### ADM-CAT-002 — Product list, edit, and delete

**Tags:** `@admin @catalog @product @regression` · **Priority:** P0

**Steps:** Search/page the list, edit a product, cancel an edit, delete with cancel then confirm, and test a product referenced by orders.  
**Expected:** List/cache refreshes; cancel makes no change; deletion is confirmed and follows referential-history rules; public visibility updates.

### ADM-CAT-003 — Variant lifecycle

**Tags:** `@admin @product @inventory @smoke` · **Priority:** P0

**Steps:** Create variants with SKU, volume, ABV, price, sale/stock/status and media; edit; delete; test duplicate SKU and invalid numeric boundaries.  
**Expected:** Valid variants persist; SKU is unique; price/volume/ABV/quantity rules are enforced; public product selection reflects active variants only.

### ADM-CAT-004 — Category lifecycle

**Tags:** `@admin @catalog @smoke` · **Priority:** P1

**Steps:** Create, edit, image-upload, and delete a category; try duplicate/blank names and deletion while products use it.  
**Expected:** Validation and confirmation work; public filters/routes update; referenced data is reassigned, blocked, or safely retained per API policy.

### ADM-CAT-005 — Brand lifecycle

**Tags:** `@admin @catalog @smoke` · **Priority:** P1

**Steps:** Create, edit, upload media, and delete a brand; try duplicate/blank names and deletion while in use.  
**Expected:** Admin/public lists refresh; validation and referential rules prevent orphaned products.

### ADM-MED-001 — Media upload

**Tags:** `@admin @catalog @security @negative` · **Priority:** P1

**Steps:** Upload supported images, oversized files, wrong MIME/extension, corrupt files, duplicate files, and unsafe names; remove/reorder multiple media where available.  
**Expected:** Valid media previews and persists; invalid files are rejected before association; no script execution/path leakage; accessible alt/fallback behavior remains.

## 12. Admin inventory and orders

### ADM-INV-001 — Inventory list and adjustment

**Tags:** `@admin @inventory @smoke` · **Priority:** P0

**Steps:** Find a variant; add and subtract stock with a note/reason; attempt zero, invalid, and below-zero adjustments; refresh.  
**Expected:** Quantity changes atomically once, never below zero; public availability updates; failures do not leave optimistic values.

### ADM-INV-002 — Adjustment history and concurrency

**Tags:** `@admin @inventory @regression @security` · **Priority:** P0

**Steps:** Open variant history and compare actor/time/reason/delta; perform simultaneous adjustments/orders near the last unit.  
**Expected:** Audit order and resulting balance are correct; actor is recorded; concurrency cannot oversell or silently lose an adjustment.

### ADM-ORD-001 — Admin order list and detail

**Tags:** `@admin @order @smoke` · **Priority:** P0

**Steps:** Page through orders and open pickup/delivery details in every status.  
**Expected:** Customer, items, payment, totals, address, schedule, notes, and fulfillment history match the source order; error/not-found states are safe.

### ADM-ORD-002 — Pickup fulfillment transitions

**Tags:** `@admin @order @pickup @smoke` · **Priority:** P0

**Steps:** Move an eligible pickup order through `PREPARING`, `READY_FOR_PICKUP`, and `PICKED_UP`; try skipping/backtracking/repeating states.  
**Expected:** Allowed transitions persist and add one audit event; invalid transitions are blocked; customer view refreshes to the same status.

### ADM-ORD-003 — Delivery fulfillment and refusal

**Tags:** `@admin @order @delivery @smoke` · **Priority:** P0

**Steps:** Move through `PREPARING`, `READY_FOR_DELIVERY`, `OUT_FOR_DELIVERY`, and `DELIVERED`; separately select `REFUSED` with each refusal reason and a note.  
**Expected:** Valid events persist in order; refusal requires an allowed reason and records the note/actor; final states cannot be accidentally changed.

### ADM-ORD-004 — Admin order update failure/concurrency

**Tags:** `@admin @order @negative` · **Priority:** P0

**Steps:** Simulate 401/403/409/500 and have two admins update the same order.  
**Expected:** UI reports the failure, does not show a false state, and refreshes conflict data; authorization and transition rules remain server-side.

## 13. Admin store configuration

### ADM-STORE-001 — Store information

**Tags:** `@admin @store @integration` · **Priority:** P1

**Steps:** Edit primary/secondary phone, email, and description; test invalid and long values; reload public pages.  
**Expected:** Valid values persist and publish consistently; invalid values do not save; public content is escaped safely.

### ADM-STORE-002 — Location and map

**Tags:** `@admin @store @integration` · **Priority:** P1

**Steps:** Edit address, city, state, postal code, latitude, longitude, and Google Maps URL; test invalid coordinate ranges and unsafe URLs.  
**Expected:** Valid location persists and public map/directions update; invalid coordinates/schemes are rejected and do not break map rendering.

### ADM-STORE-003 — Operating hours

**Tags:** `@admin @store @checkout @integration` · **Priority:** P0

**Steps:** Edit all days, mark Sunday closed, test close-before-open/overlap/missing time, then inspect public hours and checkout slots.  
**Expected:** Only valid hours save; closed days display correctly; all public surfaces and selectable fulfillment slots reflect the update.

### ADM-STORE-004 — Social links

**Tags:** `@admin @store @security` · **Priority:** P1

**Steps:** Add, edit, and delete Facebook, Instagram, TikTok, and X links; try duplicate platforms and unsafe/invalid URLs.  
**Expected:** One link per platform; valid links publish; deletion is confirmed; unsafe schemes are never rendered as executable links.

### ADM-SET-001 — Admin settings and account

**Tags:** `@admin @auth @security` · **Priority:** P1

**Steps:** Review identity, attempt save, logout, and delete-account confirmation/cancellation.  
**Expected:** Connected controls persist or are clearly disabled; cancel is non-destructive; logout/deletion clear private cache and revoke access.

## 14. Planned admin modules

These screens currently present static/demo or incomplete controls. Execute visual/navigation cases now; enable full behavior cases when API integration is complete.

| ID | Feature | Tags | Planned acceptance criteria |
|---|---|---|---|
| PLAN-001 | Dashboard | `@admin @planned` | Metrics and recent orders derive from current authorized API data; links route correctly; empty/error states work. |
| PLAN-002 | Reports/export | `@admin @planned` | Date/filter totals reconcile with orders/payments; export matches filters, locale, headers, and permissions. |
| PLAN-003 | Customers | `@admin @planned @security` | Search/detail/pagination work; only minimum necessary customer data is exposed; no cross-role mutation is possible. |
| PLAN-004 | Coupons | `@admin @planned @checkout` | Create/edit/disable rules validate dates, limits, eligibility, and rounding; checkout prevents stacking/replay. |
| PLAN-005 | Homepage banners | `@admin @planned @store` | Upload, placement, schedule, ordering, preview, activation, and deletion publish accurately and safely. |
| PLAN-006 | SMS/email signups | `@admin @planned @security` | Consent, duplicate handling, unsubscribe, export access, PII protection, and success/failure states meet policy. |
| PLAN-007 | Delivery zones | `@admin @planned @delivery @checkout` | Zone/fee/minimum/order rules validate addresses server-side and recalculate checkout totals. |
| PLAN-008 | Help & support | `@admin @planned` | Articles/actions resolve to current documentation and support channels; no dead links. |

## 15. Cross-cutting quality cases

### X-001 — Responsive layout and browser coverage

**Tags:** `@responsive @guest @customer @admin` · **Priority:** P1

Test current Chrome, Safari, Firefox, and Edge at phone/tablet/desktop widths. **Expected:** no clipped content, horizontal overflow, unusable dialogs/tables, hidden controls, or layout-blocking image failures.

### X-002 — Keyboard and screen-reader accessibility

**Tags:** `@accessibility @guest @customer @admin` · **Priority:** P1

Navigate all critical flows without a pointer and inspect with a screen reader. **Expected:** logical focus order, visible focus, labeled inputs/buttons, correct headings/landmarks, announced errors/toasts, trapped/restored modal focus, and meaningful image alternatives.

### X-003 — Contrast, zoom, and reduced motion

**Tags:** `@accessibility @responsive` · **Priority:** P1

Check contrast, 200% browser zoom, text spacing, and reduced-motion preference. **Expected:** content and actions remain readable/operable; state is not conveyed by color alone; decorative motion can be reduced.

### X-004 — API/network resilience

**Tags:** `@negative @integration` · **Priority:** P1

Simulate offline, slow, 400, 401, 403, 404, 409, 422, 429, and 500 responses on key reads/writes. **Expected:** finite loading states, understandable feedback/retry, no stale success, no private-data flash, and no duplicate mutation after retry.

### X-005 — Web security baseline

**Tags:** `@security @guest @customer @admin` · **Priority:** P0

Test XSS strings in all text fields, CSRF protection on mutations, open redirects, object ownership, cookie flags, sensitive caching, clickjacking/security headers, and secret/token exposure. **Expected:** input is encoded/validated, cross-site mutations fail, authorization is server-enforced, cookies are appropriately `HttpOnly`/`Secure`/`SameSite`, and logs/UI/URLs contain no secrets.

### X-006 — Performance and discoverability

**Tags:** `@catalog @responsive` · **Priority:** P2

Measure home, shop, product, cart, and checkout on a throttled mobile connection. Inspect metadata, title, canonical/robots behavior, semantic content, and broken assets. **Expected:** agreed Core Web Vitals/performance budgets pass; commerce pages remain usable during load; public pages have meaningful metadata and protected pages are not indexed.

## 16. Minimum release smoke suite

A release is not ready if a P0 smoke case fails. At minimum run:

`PUB-001`, `PUB-003`, `CAT-001`, `PROD-001`, `AUTH-001`, `AUTH-005`, `AUTH-009`, `CART-001`, `CART-002`, `ADDR-001`, `CHK-001`, `CHK-002`, `CHK-003`, `CHK-008`, `ORD-001`, `ADM-CAT-001`, `ADM-CAT-003`, `ADM-INV-001`, `ADM-ORD-001`, `ADM-ORD-002`, and `ADM-ORD-003`.

For every payment-related deployment, also run `CHK-004` through `CHK-008`. For every authentication/proxy change, run `AUTH-003` through `AUTH-010` and `X-005`.

## 17. Exit criteria

- All in-scope P0 cases pass; no open critical/high defect affects authentication, authorization, payment, order totals, inventory, or customer privacy.
- At least 95% of in-scope P1 cases pass, with documented product-owner acceptance for any exception.
- Failed and blocked cases have evidence and a linked defect or explicit release waiver.
- Checkout totals reconcile from cart through payment and order detail.
- Guest, customer, and admin access rules have been verified at both UI and API levels.
- Planned cases are excluded only when the underlying feature is explicitly out of release scope.
