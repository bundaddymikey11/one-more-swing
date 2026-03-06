# Booking Flow Refactor

## Architecture

The booking flow has been refactored from a global overlay (`BookingOverlay`) into a dedicated route (`/book`). This architectural shift ensures proper encapsulation, better accessibility on mobile devices, and most importantly, resolves the scroll-lock leakage issues that previously occurred on mobile Safari and Android Chrome.

### Key Components

1. **`pages/book.tsx` & `/book` Route:**
   - Registers a new Wouter route for `/book`.
   - On mount, it completely disables the global Lenis smooth scrolling instance by calling `lenis.stop()` and restoring normal browser flow.
   - On unmount, it resumes Lenis. This guarantees that background scrolling issues native to body-lock hacks are avoided.

2. **`components/booking/BookingWizard.tsx`:**
   - A multi-step form built with `react-hook-form` and validation via Zod using the `insertBookingSchema`.
   - The wizard holds state for visually rich selections (package hovering with glow) and handles submission to the backend endpoint `/api/bookings`.
   - **Step 1:** Users select an Hourly/All-Day package. Packages include visual hover states (`btn-glow`) and persistent selection states.
   - **Step 2:** Uses `shadcn` Calendar and custom time-slot grid (`TIME_SLOTS`) array strictly defining morning to evening hours.
   - **Step 3:** Collects detailed information including first name, last name, email, phone, event length, location, and optional file attachments.
   - **Step 4:** A summary view that reviews all selected values. When submitted, the `useMutation` hook fires a payload to the backend.

3. **Fallback Storage (`server/storage.ts`):**
   - The backend was updated with `MemStorage` fallback. In local environments where `DATABASE_URL` is omitted, `MemStorage` prevents crashes, allowing the booking form to successfully mock a DB insertion.

4. **Integration with Site (Home Page):**
   - Links in `Header.tsx`, `HeroSection.tsx`, `Footer.tsx` and buttons like "Get a quote" or "Inquire now" use `useLocation` from Wouter to push `setLocation('/book')`.
   - Package-specific buttons in the `PricingSection` pass `?package={{id}}` in the URL to preselect the package automatically for the user context.

## Local Testing

1. Run `npm run dev`.
2. Click any "Book Now" or "Inquire" button on the homepage.
3. You will be routed to `/book`. Background layout will cleanly unmount, and Lenis scroll will be cleanly destroyed internally.
4. Completing the form will trigger a mock success locally (if no Postgres DB URL is defined in `.env`).

## Future Considerations
- Attach a real email processor (e.g., Resend, Sendgrid) to the `/api/bookings` route handler when taking the application to production.
- Refine file attachments storage using an S3 bucket or similar Blob storage integration.
