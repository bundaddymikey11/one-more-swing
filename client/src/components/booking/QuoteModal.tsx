import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        } catch (err) {
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                        onClick={resetAndClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="w-[calc(100%-24px)] sm:w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-white tracking-tight">Request a Quote</h3>
                                    <p className="text-sm text-white/50 mt-1">Full event coverage packages.</p>
                                </div>
                                <button
                                    onClick={resetAndClose}
                                    className="text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto px-6 py-6 custom-scrollbar">
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-12 text-center"
                                    >
                                        <CheckCircle2 className="w-14 h-14 text-primary mb-4" />
                                        <h4 className="text-2xl font-serif font-bold text-white mb-2">Request Sent</h4>
                                        <p className="text-white/60 mb-8 max-w-[280px]">
                                            We've received your inquiry and will be in touch with a custom quote shortly.
                                        </p>
                                        <Button onClick={resetAndClose} className="luxury-button px-8">
                                            Done
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label htmlFor="name" className="text-sm font-medium text-white/80">Full Name *</label>
                                            <Input id="name" name="name" required className="h-11 sm:h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="John Doe" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label htmlFor="email" className="text-sm font-medium text-white/80">Email *</label>
                                                <Input id="email" name="email" type="email" required className="h-11 sm:h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="john@example.com" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="phone" className="text-sm font-medium text-white/80">Phone *</label>
                                                <Input id="phone" name="phone" type="tel" required className="h-11 sm:h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="(555) 123-4567" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label htmlFor="date" className="text-sm font-medium text-white/80">Event Date</label>
                                                <Input id="date" name="date" type="date" required className="h-11 sm:h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30 flex items-center" style={{ colorScheme: "dark" }} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="type" className="text-sm font-medium text-white/80">Event Type</label>
                                                <select
                                                    id="type"
                                                    name="type"
                                                    className="flex h-11 sm:h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white appearance-none outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="Corporate" className="bg-[#0a0a0a] text-white">Corporate</option>
                                                    <option value="Wedding" className="bg-[#0a0a0a] text-white">Wedding</option>
                                                    <option value="Private Party" className="bg-[#0a0a0a] text-white">Private Party</option>
                                                    <option value="Tournament" className="bg-[#0a0a0a] text-white">Tournament</option>
                                                    <option value="Other" className="bg-[#0a0a0a] text-white">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label htmlFor="location" className="text-sm font-medium text-white/80">Event Location</label>
                                                <Input id="location" name="location" className="h-11 sm:h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="City, State or Venue" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="guests" className="text-sm font-medium text-white/80">Est. Guest Count</label>
                                                <Input id="guests" name="guests" type="number" min="1" className="h-11 sm:h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30" placeholder="e.g. 100" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="message" className="text-sm font-medium text-white/80">Message</label>
                                            <Textarea id="message" name="message" rows={4} className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/30 resize-none" placeholder="Tell us more about your event..." />
                                        </div>

                                        <div className="pt-4">
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
        </AnimatePresence>
    );
}
