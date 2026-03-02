import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Mail, Phone } from "lucide-react";
import { useEffect } from "react";
import { scrollToSection } from "@/lib/scrollTo";
import logoImage from "@assets/Logo_1771044908308.png";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

const menuItems = [
  { label: "About", id: "about" },
  { label: "Experience", id: "tech" },
  { label: "Packages", id: "packages" },
  { label: "FAQ", id: "faq" },
];

export function MobileNav({ isOpen, onClose, onOpenBooking }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleScrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      scrollToSection(id);
    }, 300);
  };

  const handleBookClick = () => {
    onClose();
    setTimeout(() => {
      onOpenBooking();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[1001] w-full sm:w-[450px] bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5">
              <img src={logoImage} alt="One More Swing" className="h-10 w-auto opacity-80" />
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-white/5"
                aria-label="Close navigation"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto py-8 px-8 sm:px-10 flex flex-col">
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
                  className="text-3xl sm:text-4xl font-serif font-bold text-primary hover:text-white text-left transition-colors duration-300 py-2 min-h-[48px] flex items-center"
                  data-testid="link-mobile-booking"
                >
                  Book Event
                </motion.button>
              </nav>
              <div className="mt-auto pt-8 space-y-6 pb-6">
                <div className="h-px w-full bg-white/10" />
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="mailto:info@onemoreswing.golf"
                    className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors min-h-[64px]"
                    data-testid="link-mobile-email"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Email Us</span>
                  </a>
                  <a
                    href="tel:+17602169598"
                    className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors min-h-[64px]"
                    data-testid="link-mobile-phone"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Call Us</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
