import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { X, Instagram, Mail, Phone } from "lucide-react";
import { useEffect } from "react";
import logoImage from "@assets/Logo_1771044908308.png";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "About", id: "about" },
  { label: "Experience", id: "tech" },
  { label: "Packages", id: "packages" },
  { label: "FAQ", id: "faq" },
  { label: "Book Event", id: "booking" },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
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

  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[1001] w-full sm:w-[400px] bg-[#050505] border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <img src={logoImage} alt="One More Swing" className="h-10 w-auto opacity-80" />
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-12 px-8 flex flex-col gap-8">
              <nav className="flex flex-col gap-6">
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={() => scrollTo(item.id)}
                    className="text-4xl font-serif font-bold text-white/80 hover:text-primary text-left transition-colors"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </nav>
              <div className="mt-auto space-y-8">
                <div className="h-px w-full bg-white/10" />
                <div className="grid grid-cols-2 gap-4">
                  <a href="mailto:info@onemoreswing.golf" className="flex flex-col gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Mail className="w-5 h-5 text-primary" /><span className="text-xs text-white/60">Email Us</span>
                  </a>
                  <a href="tel:+17602169598" className="flex flex-col gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <Phone className="w-5 h-5 text-primary" /><span className="text-xs text-white/60">Call Us</span>
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