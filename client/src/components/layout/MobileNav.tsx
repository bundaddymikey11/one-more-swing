import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { scrollToSection } from "@/lib/scrollTo";
import { getLenis } from "@/App";
import logoImage from "@assets/Logo_1771044908308.png";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

const menuItems = [
  { label: "About", id: "about-section" },
  { label: "Contact", id: "contact-section" },
  { label: "Experience", id: "services-section" },
  { label: "Packages", id: "booking-section" },
  { label: "FAQ", id: "faq-section" },
];

export function MobileNav({ isOpen, onClose, onOpenBooking }: MobileNavProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll & pause Lenis while menu is open
  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
      // Reset drawer scroll position every time it opens
      requestAnimationFrame(() => {
        drawerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      });
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleScrollTo = useCallback((id: string) => {
    onClose();
    // Wait for close animation to fully complete before scrolling
    setTimeout(() => {
      scrollToSection(id);
    }, 400);
  }, [onClose]);

  const handleBookClick = useCallback(() => {
    onClose();
    setTimeout(() => {
      scrollToSection('booking-section');
    }, 400);
  }, [onClose]);

  // Render via portal so the drawer is NOT inside <motion.header>'s
  // transform context — this is what caused `position: fixed` to break
  // and made the drawer appear half-visible / anchored to scroll position.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[9999] w-full sm:w-[450px] bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col"
            style={{
              height: "100dvh",
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5 shrink-0">
              <img src={logoImage} alt="One More Swing" className="h-10 w-auto opacity-80" />
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-white/5"
                aria-label="Close navigation"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            {/* Scrollable content */}
            <div
              ref={drawerRef}
              className="flex-1 min-h-0 overflow-y-auto py-8 px-8 sm:px-10 flex flex-col"
            >
              <nav className="flex flex-col gap-4" aria-label="Main navigation">
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={() => handleScrollTo(item.id)}
                    className="text-3xl sm:text-4xl font-serif font-bold text-white/80 hover:text-primary text-left transition-colors duration-300 py-2 min-h-[48px] flex items-center"
                    data-testid={`link-mobile-${item.id}`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleBookClick}
                  className="text-3xl sm:text-4xl font-serif font-bold text-white/80 hover:text-primary text-left transition-colors duration-300 py-2 min-h-[48px] flex items-center"
                  data-testid="link-mobile-booking"
                >
                  Book Event
                </motion.button>
              </nav>
              <div className="mt-auto pt-8 pb-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
