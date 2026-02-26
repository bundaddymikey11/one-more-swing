# One More Swing - Luxury Mobile Golf Simulator Website

## Overview

This is a luxury single-page website for "One More Swing," a premium mobile golf simulator rental service in Southern California. The site features an ultra-dark luxury design theme with glassmorphism effects, scroll-triggered animations, and a booking form that submits to a PostgreSQL database. The business offers mobile golf simulator experiences for corporate events, weddings, private parties, community celebrations, and other gatherings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (no SSR, pure SPA)
- **Routing**: Wouter (lightweight client-side router) — home page, contact page, and 404
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode enabled by default
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives — comprehensive component library already installed
- **Animations**: Framer Motion for scroll-triggered reveal animations
- **Forms**: React Hook Form with Zod resolver for validation
- **Data Fetching**: TanStack React Query with a custom `apiRequest` helper
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via `tsx`
- **API Structure**: RESTful endpoints under `/api/` prefix
  - `POST /api/bookings` — create a new booking (validated with Zod)
  - `GET /api/bookings` — list all bookings
- **Validation**: Zod schemas shared between client and server via `shared/schema.ts`, using `drizzle-zod` for auto-generating insert schemas from the database schema

### Database
- **Database**: PostgreSQL (required, uses `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `node-postgres` driver
- **Schema Location**: `shared/schema.ts` — single source of truth for both DB schema and validation
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Tables**:
  - `bookings` — id (UUID, auto-generated), name, email, event_date, event_type, location (optional), message (optional)

### Project Structure
```
client/           → React frontend (Vite SPA)
  src/
    components/ui/ → shadcn/ui components
    pages/         → Page components (home, contact, not-found)
    hooks/         → Custom React hooks
    lib/           → Utilities (queryClient, cn helper)
server/           → Express backend
  index.ts        → Server entry point
  routes.ts       → API route registration
  storage.ts      → Database access layer (IStorage interface)
  db.ts           → Database connection setup
  vite.ts         → Vite dev server middleware
  static.ts       → Production static file serving
shared/           → Shared code between client and server
  schema.ts       → Drizzle schema + Zod validation
script/           → Build scripts
attached_assets/  → Reference materials and design specs
```

### Dev vs Production
- **Development**: Vite dev server runs as Express middleware with HMR
- **Production**: Client is built to `dist/public/`, server is bundled with esbuild to `dist/index.cjs`

### Design System — "Premium Cinematic" Theme
- Ultra-dark luxury theme (background ~#050505 in dark mode)
- Green accent color (grass green from logo) for primary/CTA elements
- CSS variables for all colors, dark mode always enabled
- **Film grain overlay**: SVG noise texture, animated, fixed position, pointer-events:none
- **Lenis smooth scroll**: Silky weighted scroll behavior initialized in App.tsx
- **Parallax hero**: Background image moves 30% slower via Framer Motion useScroll/useTransform
- **Mask-up reveal animations**: clipPath inset reveals on headlines (1s cubic-bezier)
- **Fluid typography**: clamp() for all headlines, letter-spacing -0.05em, line-height 0.9
- **Tiny sub-labels**: text-[10px] tracking-[0.35em] uppercase for editorial look
- **Massive whitespace**: py-24/py-40/py-56 for luxury spacing
- **Asymmetric layouts**: Off-center grid columns, overlapping decorative borders
- **Mobile FAB**: "Inquire" floating pill button appears after 600px scroll (mobile only)
- **Haptic press**: All buttons scale to 0.96 on :active for physical feel
- **Header**: Nav links only (no logo), transparent-to-solid transition on scroll
- **Hero**: Logo image centered as main visual, "Mobile Golf Simulator Rental" sub-label
- Glassmorphism effects for pricing cards
- Custom fonts: Montserrat (sans), Playfair Display (serif), JetBrains Mono (mono)

### Site Sections (Home Page)
1. **Announcement Banner** — "Be Among the First..." clickable, scrolls to Packages
2. **Hero** — Logo as centerpiece, "destination" in green bold, CTAs
3. **About (Our Story)** — Multi-paragraph narrative copy, no stats
4. **The Experience** — 4 tech cards: Home Tee Hero, GSPro, Performance Bay, Equipment
5. **Packages & Pricing** — Executive ($225/hr first 5 bookings) + All Day (Get a Quote)
6. **Logistics** — Space (18x18x12 ft) and Power requirements
7. **Book Your Event** — Form with 6 event types including "Other Special Occasion" with custom text field, 04/05 slots counter
8. **Footer** — Quick Links + Get in Touch (email, phone, Instagram @onemoreswing_)

### Contact Page (/contact)
- Separate page with same cinematic styling
- Contact Information card (phone, email, service area)
- Why Choose Us card
- Send a Message form
- No logo in header (matches home page)

### Contact Information
- Phone: 760-216-9598
- Email: info@onemoreswing.golf
- Instagram: @onemoreswing_ (https://www.instagram.com/onemoreswing_/)
- Service area: Southern California

## External Dependencies

- **PostgreSQL**: Required database, connection via `DATABASE_URL` environment variable
- **Lenis**: Smooth scroll library for weighted scroll behavior
- **Google Fonts**: Montserrat, Playfair Display, DM Sans, Geist Mono, Fira Code, Architects Daughter loaded via CDN
- **No authentication**: Currently no auth system implemented
- **No payment processing**: Pricing is displayed but no Stripe integration yet
- **No email service**: Booking form saves to DB only, no email notifications configured
