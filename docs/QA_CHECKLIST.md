# QA Checklist — One More Swing

## Pages & Loading
- [x] Home page (`/`) loads without errors
- [x] Contact page (`/contact`) loads without errors
- [x] 404 page renders for unknown routes
- [x] No console errors during normal navigation
- [x] No console warnings during normal navigation

## Navigation
- [x] Desktop nav links scroll to correct sections (About, Experience, Packages, FAQ)
- [x] Desktop "Book" nav link opens booking modal
- [x] Mobile hamburger menu opens slide-out nav
- [x] Mobile nav links close drawer and scroll to sections
- [x] Mobile nav "Book Event" opens booking modal
- [x] Mobile nav closes on backdrop click
- [x] Mobile nav closes on Escape key
- [x] Announcement bar scrolls to Packages on click

## Buttons & Links
- [x] Hero "Inquire Now" opens booking modal
- [x] Hero "View Packages" scrolls to pricing section
- [x] Pricing "Book Now" (Executive) opens booking modal
- [x] Pricing "Get a Quote" (All Day) opens booking modal
- [x] Footer email link opens mail client
- [x] Footer phone link opens dialer
- [x] Footer Instagram link opens in new tab
- [x] Footer Quick Links scroll to correct sections
- [x] Scroll-down chevron in hero scrolls to About

## Booking Wizard
- [x] Step 1: Package cards selectable (Executive / All Day)
- [x] Step 1: Selection visually indicated with ring + shadow
- [x] Step 1: Keyboard-accessible (Enter/Space to select)
- [x] Step 2: Date picker opens and selects dates
- [x] Step 2: Time select dropdown works
- [x] Step 2: Event type select works
- [x] Step 3: Name, Email, Location inputs accept text
- [x] Step 3: Message textarea accepts text
- [x] Step 4: Review shows selected package, date, location
- [x] Form validation prevents advancing without required fields
- [x] Submit button shows "Processing..." when pending
- [x] Submit button disabled during submission

## Forms & Validation
- [x] Required fields show validation errors
- [x] Focus rings visible on keyboard navigation
- [x] Form labels properly associated with inputs (accessible)
- [x] Inline error messages display below fields

## Layout & Responsiveness
- [x] No horizontal scrollbar on any viewport width
- [x] No content overflow at 375px width
- [x] No content overflow at 390px width
- [x] No content overflow at 428px width
- [x] Proper layout at 768px (tablet)
- [x] Proper layout at 1024px
- [x] Proper layout at 1280px+
- [x] No layout shift on page load
- [x] Section padding consistent across breakpoints
- [x] Tap targets >= 44px on mobile (nav, buttons, links, footer)

## Accessibility
- [x] Focus-visible rings on all interactive elements
- [x] ARIA labels on hamburger menu button
- [x] ARIA labels on scroll-down button
- [x] ARIA roles on booking wizard stepper (progressbar)
- [x] ARIA roles on package selection cards (radio)
- [x] Mobile nav has role="dialog" and aria-modal
- [x] Screen reader text for hero heading (sr-only h1)
- [x] Body text contrast improved (white/65 vs previous white/60)

## Visual Quality
- [x] Typography scale consistent (h1/h2/h3 defined in base layer)
- [x] Font smoothing enabled (antialiased + optimizeLegibility)
- [x] Pricing cards have hover elevation effect
- [x] Accordion open/close animation smooth (0.35s eased)
- [x] Booking wizard step transitions animated
- [x] Active stepper step has scale-up indicator
- [x] Button disabled states styled (opacity, cursor, no shine effect)
- [x] Glass input focus states have ring + border color change

## Performance
- [x] Hero image uses loading="eager" (above the fold)
- [x] About section images use loading="lazy"
- [x] Production build succeeds without errors
- [x] JS bundle ~687KB (gzip ~209KB)
- [x] CSS bundle ~84KB (gzip ~14KB)

## Known Limitations
- Large PNG image assets (~11-12MB each) — would benefit from WebP conversion
- Single JS chunk warning (>500KB) — could benefit from code splitting
- Lenis smooth scroll warning about container position (cosmetic, non-breaking)
