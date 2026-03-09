import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Locks body scroll for the duration the modal is open, restoring exact scroll position on close. */
function useScrollLock(isOpen: boolean) {
    useEffect(() => {
        if (!isOpen) return;

        const scrollY = window.scrollY;
        const originalStyles = {
            position: document.body.style.position,
            overflow: document.body.style.overflow,
            width: document.body.style.width,
            top: document.body.style.top,
        };

        // Lock: pin body at current scroll position
        document.body.style.position = "fixed";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY}px`;

        return () => {
            // Restore
            document.body.style.position = originalStyles.position;
            document.body.style.overflow = originalStyles.overflow;
            document.body.style.width = originalStyles.width;
            document.body.style.top = originalStyles.top;
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);
}

/** Calls onClose when Escape is pressed. */
function useEscapeKey(onClose: () => void, enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose, enabled]);
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useScrollLock(isOpen);
    useEscapeKey(onClose, isOpen);

    // Focus the panel when it opens so Escape works and screen readers announce it
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => panelRef.current?.focus());
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("https://formsubmit.co/ajax/info@onemoreswing.golf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    _captcha: "false",
                    _subject: "New Quote Request — One More Swing",
                    _template: "table",
                }),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                throw new Error("Failed to send request.");
            }
        } catch {
            setError("There was an error sending your request. Please try again or email us directly at info@onemoreswing.golf.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        onClose();
        setTimeout(() => {
            setIsSuccess(false);
            setError(null);
        }, 300);
    };

    // Portal renders outside all parent transforms / overflow containers
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ─────────────────────────────────────────── */}
                    <motion.div
                        key="quote-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                        onClick={resetAndClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99998,
                            background: "rgba(0,0,0,0.72)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            touchAction: "none",
                            overscrollBehavior: "none",
                        }}
                    />

                    {/* ── Centering shell ──────────────────────────────────── */}
                    <div
                        key="quote-shell"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Request a Quote"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // Safe area padding so panel never hides behind notch / browser chrome
                            paddingTop: "max(20px, env(safe-area-inset-top))",
                            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
                            paddingLeft: "max(16px, env(safe-area-inset-left))",
                            paddingRight: "max(16px, env(safe-area-inset-right))",
                            pointerEvents: "none", // backdrop handles its own clicks
                            touchAction: "none",
                            overscrollBehavior: "none",
                        }}
                    >
                        {/* ── Modal panel ──────────────────────────────────── */}
                        <motion.div
                            ref={panelRef}
                            tabIndex={-1}
                            key="quote-panel"
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                pointerEvents: "auto",
                                width: "100%",
                                maxWidth: "480px",
                                maxHeight: "calc(100dvh - max(40px, env(safe-area-inset-top)) - max(40px, env(safe-area-inset-bottom)))",
                                display: "flex",
                                flexDirection: "column",
                                background: "#0a0a0a",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: "16px",
                                boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
                                outline: "none",
                                overscrollBehavior: "contain",
                            }}
                        >
                            {/* ── Sticky header with close button ──────────── */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "20px 24px 16px",
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    flexShrink: 0,
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", fontFamily: "serif", letterSpacing: "-0.03em", margin: 0 }}>
                                        Request a Quote
                                    </h3>
                                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                                        Full event coverage packages.
                                    </p>
                                </div>
                                {/* Close button — always on top, large tap target */}
                                <button
                                    type="button"
                                    onClick={resetAndClose}
                                    aria-label="Close modal"
                                    style={{
                                        position: "relative",
                                        zIndex: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        color: "rgba(255,255,255,0.7)",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        touchAction: "manipulation",
                                        WebkitTapHighlightColor: "transparent",
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <X style={{ width: "18px", height: "18px" }} />
                                </button>
                            </div>

                            {/* ── Scrollable form body ─────────────────────── */}
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    WebkitOverflowScrolling: "touch" as never,
                                    overscrollBehavior: "contain",
                                    padding: "20px 24px 24px",
                                }}
                            >
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 0" }}
                                    >
                                        <CheckCircle2 style={{ width: "52px", height: "52px", color: "#22c55e", marginBottom: "16px" }} />
                                        <h4 style={{ fontSize: "22px", fontFamily: "serif", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Request Sent</h4>
                                        <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "28px", maxWidth: "260px", lineHeight: 1.6 }}>
                                            We've received your inquiry and will be in touch with a custom quote shortly.
                                        </p>
                                        <Button onClick={resetAndClose} className="luxury-button px-8">
                                            Done
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        {error && (
                                            <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "13px" }}>
                                                {error}
                                            </div>
                                        )}

                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="name" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Full Name *</label>
                                            <Input id="name" name="name" required className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="John Doe" />
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="email" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Email *</label>
                                            <Input id="email" name="email" type="email" required className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="john@example.com" />
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="phone" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Phone *</label>
                                            <Input id="phone" name="phone" type="tel" required className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="(555) 123-4567" />
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="date" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Event Date</label>
                                            <Input id="date" name="date" type="date" required className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" style={{ colorScheme: "dark" }} />
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="type" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Event Type</label>
                                            <select
                                                id="type"
                                                name="type"
                                                style={{ height: "44px", width: "100%", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: "0 12px", fontSize: "14px", color: "#fff", appearance: "none", outline: "none" }}
                                            >
                                                <option value="Corporate" style={{ background: "#0a0a0a" }}>Corporate</option>
                                                <option value="Wedding" style={{ background: "#0a0a0a" }}>Wedding</option>
                                                <option value="Private Party" style={{ background: "#0a0a0a" }}>Private Party</option>
                                                <option value="Tournament" style={{ background: "#0a0a0a" }}>Tournament</option>
                                                <option value="Other" style={{ background: "#0a0a0a" }}>Other</option>
                                            </select>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="location" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Event Location</label>
                                            <Input id="location" name="location" className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="City, State or Venue" />
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="guests" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Est. Guest Count</label>
                                            <Input id="guests" name="guests" type="number" min="1" className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="e.g. 100" />
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label htmlFor="message" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>Message</label>
                                            <Textarea id="message" name="message" rows={3} className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30 resize-none" placeholder="Tell us more about your event..." />
                                        </div>

                                        <div style={{ paddingTop: "6px" }}>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-12 luxury-button text-base rounded-xl"
                                            >
                                                {isSubmitting ? "Sending..." : "Submit Quote Request"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
