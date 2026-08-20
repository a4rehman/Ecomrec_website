# Maison Elara Ecommerce

A production-ready, premium ecommerce demo inspired by the uploaded Farasha reference screenshots and upgraded with a modern luxury storefront sys.

## Design Analysis

- Layout: centered brand mark, black announcement bar, large whitespace, thin section dividers, focused forms, and a mobile drawer menu.
- Palette: warm white, deep black, muted taupe lines, rose/camel accent, restrained red for sale labels, plus dark mode.
- Typography: elegant high-contrast serif logo/headlines with uppercase tracked micro-labels and clean sans body copy.
- Components: luxury header, collection drawer, editorial hero, product cards, filters, cart, checkout, auth forms, dashboard, admin analytics.
- Product cards: large portrait imagery, minimal metadata, small badges, rating, wishlist, quick add, sale compare price.
- Responsiveness: mobile-first grids, compact drawer nav, stable product aspect ratios, adaptive checkout/cart layouts.

## Stack

- Next.js 15 App Router
- React + TypeScript
- Tailwind CSS
- Shadcn-style local UI primitives
- Framer Motion
- Redux Toolkit
- React Query
- Axios

## Routes

Home, shop, product detail, cart, checkout, wishlist, dashboard, login, register, forgot/reset password, about, contact, blog, single blog, and admin dashboard.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Notes

Remote editorial demo images are loaded from Unsplash through Next Image optimization. Replace `maisonelara.example` in `src/app/sitemap.ts` and `src/app/robots.ts` with the production domain before deployment.
