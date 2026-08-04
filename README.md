# Childrens Dance Factory (CDF) Website

Marketing site for Childrens Dance Factory — a dance studio offering competitive and recreational programs.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + Swiss design tokens in `src/styles/globals.css`
- **GSAP** + **Lenis** for scroll/motion
- **Resend** for contact form and bag checkout emails
- Deployed on **Vercel** (`@vercel/analytics`)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Resend + roster values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Command |
|--------|---------|
| `dev` | Next.js development server |
| `build` | Production build |
| `start` | Serve production build |
| `lint` | ESLint |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest unit tests |

## Environment variables

See [`.env.example`](.env.example):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, sitemap, OG) |
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_TO_EMAIL` | Inbox for form/order emails |
| `CONTACT_FROM_EMAIL` | From address |
| `CHECKOUT_LAST_NAMES` | Comma-separated last names allowed to checkout |

## Project layout

```
src/app/           # Routes, layouts, API
src/components/    # UI sections, layout, lab, motion
src/context/       # Bag + language providers
src/lib/           # Catalog, bag helpers, route-cover
src/styles/        # Global CSS + design tokens
public/            # Static images and icons
```

## Notes

- `/staff` is the production staff experience (LML studio UI with site chrome).
- `/lab/*` remains a temporary sandbox (`robots: noindex`) for isolated experiments; prefer evolving `/staff` rather than shipping lab routes.
- Bag checkout is roster-gated and emailed via Resend — not a payment gateway.
