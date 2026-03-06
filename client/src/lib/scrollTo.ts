/**
 * Scroll offset utilities for fixed-header navigation.
 * Keeps a reference to the Lenis instance injected from App.tsx
 * to avoid circular imports.
 */

import type Lenis from "lenis";

let _lenis: Lenis | null = null;

/** Called from App.tsx once Lenis is initialized */
export function registerLenis(instance: Lenis | null): void {
  _lenis = instance;
}

function getHeaderHeight(): number {
  return 90; // Fixed 90px offset as requested for sticky header
}

export function syncScrollOffset(): void {
  document.documentElement.style.setProperty(
    "--scroll-offset",
    `90px`
  );
}

/**
 * Scroll to a section by id, accounting for the fixed header.
 * Uses Lenis (if active) for smooth scrolling, otherwise falls back
 * to native window.scrollTo.
 *
 * If the element is not found immediately, retries once after a short
 * delay (covers cases where the DOM hasn't fully painted after a
 * route change or menu close).
 */
export function scrollToSection(id: string): void {
  const attempt = () => {
    const element = document.getElementById(id);
    if (!element) return false;

    syncScrollOffset();

    const offset = 90;
    const top =
      element.getBoundingClientRect().top + window.scrollY - offset;

    if (_lenis) {
      _lenis.scrollTo(top, { duration: 1.2 });
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }
    return true;
  };

  if (!attempt()) {
    // Retry after a short delay in case the element isn't in the DOM yet
    setTimeout(() => attempt(), 100);
  }
}
