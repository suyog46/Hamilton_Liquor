# Backend-For-Frontend (BFF) Pattern

This document explains the BFF architecture used for authentication and data
fetching in this app, why it was introduced, and how each piece fits
together.

## The problem we started with

Originally, the browser talked to the real backend (`api.hamiltonliquor.shop`)
directly from RTK Query:

```
Browser ──fetch──▶ https://api.hamiltonliquor.shop/admin/categories
```

This looked reasonable, but broke in ways that were hard to diagnose:

1. **Cross-site cookies got dropped.** The frontend (`localhost:3000` in dev,
   or a separate deployment domain in production) and the API
   (`api.hamiltonliquor.shop`) are different *sites* as far as the browser is
   concerned. Cookies set with the default `SameSite=Lax` are visible in
   DevTools → Application → Cookies (the browser did receive and store them),
   but the browser **refuses to attach them** to a cross-site `fetch`/XHR
   request. The cookie exists; it just never leaves the jar.

2. **`next/server` middleware couldn't see the auth cookie at all.** Even if
   we relaxed `SameSite`, the token cookie was scoped to
   `api.hamiltonliquor.shop`, a different domain than the Next.js app itself.
   `request.cookies.get("access_token")` in middleware only ever sees cookies
   scoped to the app's *own* domain — a third-party cookie is invisible to it
   by definition. This is why `/admin` routes never redirected correctly: the
   guard was checking a cookie that could never be present.

3. **CORS credentials rules add a second layer of friction on top of #1** —
   even when configured correctly on the backend, they only control whether
   the browser is *allowed* to read the response, not whether the cookie
   attaches to the request in the first place.

None of this is fixable by tweaking fetch options on the client. The root
cause is architectural: **the browser was talking to a domain it doesn't
share cookies with.**

## The fix: route everything through our own server

A BFF (Backend-For-Frontend) is a thin server layer that sits between the
browser and the real backend, living on the **same origin as the frontend**.
The browser only ever talks to itself; the BFF is the only thing that talks
to the external API.

```
Browser ──fetch──▶ Next.js server (same origin) ──fetch──▶ api.hamiltonliquor.shop
        credentials always attach           tokens attached manually,
        (same-origin, no SameSite           server-to-server, no browser
        issue, no CORS)                     cookie rules apply at all
```

Because the browser now only ever calls its own origin, the cross-site
cookie problem disappears entirely — there's no "cross-site" request from the
browser's point of view anymore.

## How it's wired up in this repo

### 1. Auth endpoints — `src/app/api/auth/{login,refresh,logout}/route.ts`

These are Next.js Route Handlers running on our own server. `login/route.ts`:

- Calls the real backend's `auth/login` server-to-server.
- The backend returns the tokens via `Set-Cookie` (not the JSON body — see
  the "server-side calling" section below for why that matters).
- Extracts `access_token` / `refresh_token` from those `Set-Cookie` headers
  (`src/lib/api/authCookies.ts`).
- Re-issues them as **our own first-party, httpOnly cookies**, scoped to our
  own domain.

`refresh/route.ts` does the same rotation using the httpOnly `refresh_token`
cookie, and `logout/route.ts` clears both.

### 2. Route guard — `src/proxy.ts` (Next.js "Proxy", formerly `middleware.ts`)

Runs on every `/admin/*` request. Because the auth cookies are now first-party
(same domain as the app), `request.cookies.get("access_token")` actually
works. No access token → check for a refresh token → rotate it → or redirect
to `/login`.

### 3. Data proxy — `src/app/api/proxy/[...path]/route.ts`

A generic catch-all route handler. Every RTK Query call
(`admin/categories`, `admin/media`, etc.) hits `/api/proxy/<path>` instead of
the backend directly. The handler:

- Reads the httpOnly `access_token` cookie (never exposed to client JS).
- Forwards the request to the real backend with the token attached.
- Streams the request/response bodies through as-is, so this works uniformly
  for JSON *and* binary payloads (e.g. the `FormData` file upload in
  `mediaApiSlice`), without needing to parse or re-serialize anything.

### 4. Client side — `src/redux/apiSlice.ts` / `src/redux/features/auth/authApiSlice.ts`

RTK Query's `baseUrl` points at `/api/proxy/` (data) and `/api/auth/` (auth) —
both same-origin, relative paths. `credentials: "include"` now does exactly
what it looks like it does, because there's no cross-site boundary left to
cross.

## Why this solves both sides of the problem

**Client-side calling (browser → our server):** same-origin by construction,
so cookies always attach, there's no CORS negotiation to get wrong, and the
access/refresh tokens never need to be readable by client JS (both cookies
are `httpOnly`) — closing off a class of XSS token-theft that a
`document.cookie`-readable token would be exposed to.

**Server-side calling (our server → real backend):** this is a plain
server-to-server HTTP call, which has no concept of "cross-site" at all —
that restriction only exists in browsers. The only requirement is that *we*
manually carry the credential across, since Node's `fetch` has no cookie jar
of its own (a `Set-Cookie` received by one server-side `fetch()` call is
never remembered or replayed by a later one, unlike a browser). That's why
`authCookies.ts` exists, and why the proxy explicitly re-attaches the token
as a header on every outgoing request — nothing here is automatic, and that
manual, explicit forwarding is precisely what makes the flow reliable and
easy to reason about, instead of depending on cookie-jar behavior that
differs between browsers, Node, and the backend's own expectations.

## The tradeoff: an extra hop

The honest downside of a BFF is **API hopping** — every data request now
makes two network trips instead of one:

```
Browser → Next.js server → real backend → Next.js server → Browser
```

Concretely this means:

- **Added latency.** Each request pays for an extra hop, plus the overhead of
  spinning up/executing a Route Handler. For most admin-panel-style CRUD
  calls this is negligible (single-digit milliseconds on the same
  infrastructure), but it's not free, and it compounds if the frontend makes
  many small sequential calls instead of batching.
- **The BFF becomes a second thing that can be down or misconfigured.** A bug
  in the proxy (as we saw earlier — a bad export or an unsupported runtime
  config) now breaks *every* API call, not just one feature. The proxy is a
  new single point of failure sitting in front of the entire API surface.
- **Streaming/large payloads need explicit handling.** Because the proxy sits
  in the middle of every request, it has to actively stream bodies through
  (as opposed to a direct client→backend call where the browser handles that
  natively) — this is manageable, but it's another thing to get right rather
  than something you get for free.

In this project the tradeoff is worth it: the alternative (direct
browser-to-backend calls) was fundamentally broken by cross-site cookie
rules, not just slower. But it's worth remembering that a BFF is not "free
architecture" — it trades a class of cookie/CORS bugs for a small, constant
latency and operational cost on every request.
