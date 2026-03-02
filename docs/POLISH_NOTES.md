# Polish Notes — One More Swing

## Stack
- **Frontend**: React 18 + TypeScript, Vite 7.3
- **Backend**: Express 5 (Node.js)
- **Styling**: Tailwind CSS 3.4 + custom CSS variables (luxury dark theme)
- **UI Components**: shadcn/ui (Radix primitives)
- **Animation**: Framer Motion
- **Smooth Scroll**: Lenis
- **ORM/DB**: Drizzle ORM + PostgreSQL
- **Routing**: wouter (frontend), Express (backend)
- **Forms**: react-hook-form + Zod validation

## Run Commands
- `npm run dev` — starts Express + Vite dev server
- `npm run build` — production build (tsx script/build.ts)
- `npm run start` — production server (node dist/index.cjs)

## Key Routes / Pages
- `/` — Home (single-page: Hero, About, Experience, Packages, FAQ, Footer)
- `/contact` — Contact page
- `/*` — 404 Not Found

## Where Styles Live
- `client/src/index.css` — global CSS, design tokens, luxury utilities
- `tailwind.config.ts` — Tailwind theme extensions
- Inline Tailwind classes on all components

## Issues Found During Audit
1. Typography: h3 base styles missing from design system; inconsistent font sizes on headings
2. Spacing: section padding varies (py-12 vs py-16 vs py-20); no consistent rhythm
3. Contrast: body text at white/60 and white/50 is low contrast for readability
4. Nav: no visible focus rings for keyboard users; hover states subtle
5. Accordion: animation duration short (0.2s); could feel snappier with eased timing
6. Buttons: missing focus-visible rings; no consistent disabled styling
7. Form inputs: no focus ring beyond border color change
8. Images: hero image not lazy-loaded; large PNG assets not optimized
9. Inline import (MobileNav) at line 129 instead of file top
10. Footer Quick Links heading uses hardcoded hex color instead of CSS variable
