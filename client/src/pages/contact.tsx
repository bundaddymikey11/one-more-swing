import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertBookingSchema, type InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import logoImage from "@assets/Logo_1771044908308.png";

const maskUp = {
  hidden: { opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 1, ease: [0.77, 0, 0.175, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.2 },
  },
};

function ContactHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
        scrolled ? "bg-[#000000]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-14 sm:h-20">
          <Link href="/" className="flex items-center shrink-0" data-testid="link-logo-contact">
            <img src={logoImage} alt="One More Swing" className="h-10 w-10 sm:h-14 sm:w-14 rounded-full object-cover" data-testid="img-logo-contact" />
          </Link>

          <nav className="hidden md:flex items-center gap-8" data-testid="nav-contact-desktop">
            {[
              { label: "Home", href: "/" },
              { label: "About", href: "/#about" },
              { label: "Packages", href: "/#packages" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase hover-elevate px-2 py-1 rounded-md"
                data-testid={`link-contact-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/#booking">
            <Button
              className="bg-primary text-primary-foreground border border-primary-border shrink-0 btn-glow h-10 sm:h-auto"
              data-testid="button-contact-header-book"
            >
              <span className="hidden sm:inline">Inquire Now</span>
              <span className="sm:hidden text-sm">Inquire</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      name: "",
      email: "",
      eventDate: "",
      eventType: "other",
      location: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBooking) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      <div className="film-grain" />
      <ContactHeader />

      <section className="pt-32 sm:pt-44 pb-24 sm:pb-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerSlow}
          >
            <motion.div variants={maskUp} className="text-center mb-16 sm:mb-24">
              <span className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block mb-4">
                Reach Out
              </span>
              <h1
                className="font-serif font-bold text-white"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  letterSpacing: "-0.05em",
                  lineHeight: 0.9,
                }}
              >
                Get in Touch
              </h1>
              <p className="text-white/40 max-w-xl mx-auto mt-6 text-sm sm:text-base" style={{ lineHeight: 1.8 }}>
                Have a question about our services? Ready to book your event?
                Fill out the form below or give us a call.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
              <motion.div variants={maskUp} className="lg:col-span-2 space-y-6">
                <Card className="bg-white/[0.02] border-white/[0.06] p-8" data-testid="card-contact-info">
                  <h2 className="font-serif text-xl font-bold text-white mb-8" style={{ letterSpacing: "-0.03em" }}>
                    Contact Information
                  </h2>

                  <div className="space-y-7">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-primary font-semibold text-[10px] tracking-[0.25em] uppercase block mb-1">
                          Call or Text
                        </span>
                        <a
                          href="tel:+17602169598"
                          className="text-white font-semibold text-base hover-elevate px-1 py-0.5 rounded-md -ml-1 inline-block"
                          data-testid="link-phone"
                        >
                          760-216-9598
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-primary font-semibold text-[10px] tracking-[0.25em] uppercase block mb-1">
                          Email Us
                        </span>
                        <a
                          href="mailto:info@onemoreswing.golf"
                          className="text-white font-semibold text-base hover-elevate px-1 py-0.5 rounded-md -ml-1 inline-block"
                          data-testid="link-email"
                        >
                          info@onemoreswing.golf
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-primary font-semibold text-[10px] tracking-[0.25em] uppercase block mb-1">
                          Service Area
                        </span>
                        <span className="text-white font-semibold text-base" data-testid="text-service-area">
                          Southern California
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/[0.02] border-white/[0.06] p-8" data-testid="card-why-choose">
                  <h2 className="font-serif text-xl font-bold text-primary mb-6" style={{ letterSpacing: "-0.03em" }}>
                    Why Choose Us?
                  </h2>
                  <ul className="space-y-4">
                    {[
                      "Fully mobile simulator — we come to you",
                      "Tour-grade Garmin R10 launch monitor",
                      "200+ world-class courses in stunning 4K",
                      "Professional setup, support & teardown included",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-white/50 text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} className="lg:col-span-3">
                <Card className="bg-white/[0.02] border-white/[0.06] p-8 sm:p-10" data-testid="card-contact-form">
                  <h2 className="font-serif text-xl font-bold text-white mb-8" style={{ letterSpacing: "-0.03em" }}>
                    Send a Message
                  </h2>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your Name"
                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                                data-testid="input-contact-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                                data-testid="input-contact-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(555) 555-5555"
                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                                data-testid="input-contact-phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Message or Question</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How can we help you?"
                                rows={5}
                                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40 resize-none"
                                data-testid="input-contact-message"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground border border-primary-border h-12 text-base btn-glow"
                        disabled={mutation.isPending}
                        data-testid="button-contact-submit"
                      >
                        {mutation.isPending ? "Sending..." : "Send Message"}
                        {!mutation.isPending && <Send className="ml-2 w-4 h-4" />}
                      </Button>
                    </form>
                  </Form>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#020202] border-t border-white/[0.04] py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/20 text-[11px] tracking-wider">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
