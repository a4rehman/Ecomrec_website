# Meta Pixel Integration — Sawera Collection

Professional Meta (Facebook) Pixel integration for the Next.js App Router, built with `next/script` for lazy loading and a central Redux middleware so events are never duplicated.

## Installation

The pixel is installed globally in `src/components/layout/meta-pixel.tsx`, mounted in the root layout (`src/app/layout.tsx`).

- The base script loads with `strategy="afterInteractive"` (after hydration → no render blocking, no impact on Core Web Vitals).
- The base script fires `PageView` once on initial load.
- A `usePathname` effect fires `PageView` again on **every client-side route change** (no duplicates — the first render is skipped and same-pathname re-renders are ignored).
- A `<noscript>` fallback image is included for non-JavaScript visitors.
- If `NEXT_PUBLIC_META_PIXEL_ID` is missing, the entire component returns `null` — nothing loads.

## Environment Variables

| Variable                    | Example              | Required |
| --------------------------- | -------------------- | -------- |
| `NEXT_PUBLIC_META_PIXEL_ID` | `4542220069347599`   | Yes      |

Setup steps:

1. **Local:** copy `.env.example` to `.env.local` (value is already filled in).
2. **Production (Vercel):** go to Project → **Settings → Environment Variables** and add `NEXT_PUBLIC_META_PIXEL_ID` with the value above, then redeploy.

The pixel ID is `NEXT_PUBLIC_*` (safe to expose — it is public by design).

## Events Implemented

| Meta Event             | Trigger                                                        | File(s)                                                                 |
| ---------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `PageView`             | Initial load + every client-side navigation                    | `components/layout/meta-pixel.tsx`                                      |
| `ViewContent`          | Product page viewed                                            | `lib/metaPixel.ts` middleware ← `commerce/viewProduct`                  |
| `AddToCart`            | Product added to bag (all add buttons, incl. Buy Now)          | `lib/metaPixel.ts` middleware ← `commerce/addToCart`                    |
| `AddToWishlist`        | Product added to wishlist                                      | `lib/metaPixel.ts` middleware ← `commerce/toggleWishlist`               |
| `Search`               | Debounced (600ms) when searching in `/shop`                    | `components/commerce/shop-content.tsx`                                 |
| `InitiateCheckout`     | Checkout page reached (cart non-empty)                         | `app/checkout/page.tsx`                                                |
| `Purchase`             | Order successfully placed                                      | `lib/metaPixel.ts` middleware ← `commerce/createOrder`                  |
| `CompleteRegistration` | Account created on signup                                      | `components/commerce/auth-form.tsx`                                    |
| `Contact`              | Contact form submitted successfully                            | `app/contact/page.tsx`                                                 |
| `Lead`                 | Newsletter subscribe                                           | `components/layout/newsletter-form.tsx`                                |

### Event Parameters (official Meta parameters)

- **ViewContent:** `content_type`, `content_ids`, `content_name`, `content_category`, `value`, `currency`
- **AddToCart:** `content_type`, `content_ids`, `content_name`, `content_category`, `value`, `currency`, `num_items`
- **AddToWishlist:** `content_type`, `content_ids`, `content_name`, `content_category`, `value`, `currency`
- **Search:** `search_string`
- **InitiateCheckout:** `content_ids`, `content_name`, `num_items`, `value`, `currency`
- **Purchase:** `value`, `currency`, `content_ids`, `content_name`, `num_items`, `contents` (`[{id, quantity, item_price}]`)
- **CompleteRegistration:** `content_name: "register"`
- **Contact:** `content_category: "contact_form"`
- **Lead:** `content_category: "newsletter"`

All currency values are `PKR` (Pakistani Rupees). Sale prices are used automatically when a sale is active.

## How Duplicate Events Are Prevented

- The base script fires the initial `PageView`; the route tracker **skips its first run** so there is exactly one `PageView` per load.
- Route tracking uses a `lastFiredPathname` ref — React StrictMode re-renders and repeated visits to the same route do not re-fire.
- Commerce events are wired through a single Redux middleware reading the post-action state, so there is **one central place** per event — no scattered `fbq` calls.

## Testing Instructions

### Local

1. Copy `.env.example` → `.env.local`.
2. Run `npm run dev` and open the site.
3. Open **Meta Pixel Helper** browser extension.

### Verify (checklist)

| Step                        | Expected in Pixel Helper                  |
| --------------------------- | ----------------------------------------- |
| Load any page               | `PageView` fires                          |
| Navigate Home → Shop → Blog | `PageView` fires on each navigation       |
| Open a product              | `ViewContent` fires with product data     |
| Click "Add to bag"          | `AddToCart` fires with value/currency     |
| Add to wishlist             | `AddToWishlist` fires                     |
| Type in shop search         | `Search` fires (after ~600ms)             |
| Go to `/checkout`           | `InitiateCheckout` fires                  |
| Place an order              | `Purchase` fires with `contents`          |
| Create an account           | `CompleteRegistration` fires              |
| Submit contact form         | `Contact` fires                           |
| Subscribe to newsletter     | `Lead` fires                              |

> Ensure **no duplicate events** appear for a single action, and that the browser console is free of errors.

## Files

- **Created:** `src/lib/metaPixel.ts`, `src/components/layout/meta-pixel.tsx`, `src/components/layout/newsletter-form.tsx`, `.env.example`, `META_PIXEL_SETUP.md`
- **Modified:** `src/app/layout.tsx`, `src/store/store.ts`, `src/components/commerce/shop-content.tsx`, `src/app/checkout/page.tsx`, `src/components/commerce/auth-form.tsx`, `src/app/contact/page.tsx`, `src/components/layout/footer.tsx`

## Remaining Manual Setup (Meta Events Manager)

1. **Events Manager → Verify pixel** — the pixel should show as active once a `PageView` is received.
2. (Optional) Under **Custom Conversions**, create a `Purchase` custom conversion if you want it to show in reporting without editing the pixel code (the code already sends the standard `Purchase` event).
3. **Advanced Matching** (optional): the site does not currently send customer email/phone to the pixel. Enable Advanced Matching in Events Manager to improve audience matching.
4. Configure **Domains / Data Sharing** settings in Events Manager to allow Meta to use your business data for ads.
