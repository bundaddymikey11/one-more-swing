import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { MobileNav } from "@/components/layout/MobileNav";
import { createPortal } from "react-dom";
import {
  Target,
  Monitor,
  ShieldCheck,
  Trophy,
  Phone,
  Star,
  ArrowRight,
  ChevronDown,
  Mail,
  Instagram,
  CalendarIcon,
  Clock,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRef, useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { scrollToSection } from "@/lib/scrollTo";
import { packages, startingAt } from "@/lib/packages";

import logoImage from "@assets/Logo_1771044908308.png";
import simFrontImage from "@assets/Untitled_1772248722147.PNG";
import { MouseGlowCard, Magnetic } from "@/components/ui/PremiumInteractions";
import { QuoteModal } from "@/components/booking/QuoteModal";

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const maskUp = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20, clipPath: prefersReducedMotion ? "none" : "inset(100% -20% 0 -20%)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: prefersReducedMotion ? "none" : "inset(-20% -20% -20% -20%)",
    transition: { duration: prefersReducedMotion ? 0.3 : 0.75, ease: [0.77, 0, 0.175, 1] },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
  visible: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.3 : 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: prefersReducedMotion ? 0.05 : 0.12, delayChildren: 0.08 },
  },
};

const staggerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: prefersReducedMotion ? 0.08 : 0.15, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: prefersReducedMotion ? 0.3 : 0.75, ease: [0.25, 0.1, 0.25, 1] } },
};

const timeSlots = [
  "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM",
];

function AnnouncementBar() {
  return (
    <motion.div
      initial={{ clipPath: "inset(100% -20% 0 -20%)" }}
      animate={{ clipPath: "inset(-20% -20% -20% -20%)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="w-full bg-primary/90 backdrop-blur-sm text-center cursor-pointer flex items-center justify-center"
      style={{ paddingTop: "max(env(safe-area-inset-top), 6px)", paddingBottom: "6px" }}
      data-testid="banner-scarcity"
      onClick={() => scrollToSection("booking-section")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") scrollToSection("booking-section"); }}
    >
      <p
        className="text-white/95 font-medium whitespace-nowrap uppercase px-4"
        style={{ fontSize: "clamp(10.5px, 3vw, 13px)", letterSpacing: "0.08em", lineHeight: 1, fontFamily: "'Montserrat', sans-serif" }}
      >
        Be Among the First to Host One More Swing
      </p>
    </motion.div>
  );
}

function Header({ onOpenBooking }: { onOpenBooking: (pkg?: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
      className={`fixed top-0 left-0 w-full z-[999] transition-all duration-500 ${scrolled ? "bg-[#000000]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
        }`}
    >
      <AnnouncementBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-[56px] sm:h-20">
          <button
            className="md:hidden p-2 text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open Menu"
          >
            <div className="flex flex-col gap-1.5">
              <div className="w-6 h-0.5 bg-white" />
              <div className="w-6 h-0.5 bg-white" />
              <div className="w-6 h-0.5 bg-white" />
            </div>
          </button>

          <div className="hidden md:block flex-1" />

          <nav className="hidden md:flex items-center gap-6 lg:gap-8" data-testid="nav-desktop">
            {[
              { label: "About", id: "about-section" },
              { label: "Experience", id: "services-section" },
              { label: "Packages", id: "booking-section" },
              { label: "FAQ", id: "faq-section" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="nav-link-underline text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase px-3 py-2 rounded-md hover:text-white/80 transition-colors duration-200 min-h-[44px] flex items-center"
                data-testid={`link-nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("booking-section")}
              className="nav-link-underline text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase px-3 py-2 rounded-md hover:text-white/80 transition-colors duration-200 min-h-[44px] flex items-center"
              data-testid="link-nav-booking"
            >
              Book
            </button>
          </nav>
        </div>
      </div>
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenBooking={onOpenBooking}
      />
    </motion.header>
  );
}

function HeroSection({ onOpenBooking }: { onOpenBooking: (pkg?: string) => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="hero-section" ref={heroRef} className="relative min-h-[88dvh] sm:min-h-dvh flex flex-col items-center justify-start overflow-hidden" style={{ position: "relative" }}>
      <motion.div className="absolute inset-0" style={{ y: heroY }}>
        <img
          src="/images/hero-socal.png"
          alt="Southern California luxury golf lifestyle"
          className="w-full h-[120%] object-cover"
          loading="eager"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/75 via-[#050505]/50 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 text-center pt-[140px] sm:pt-[160px] lg:pt-[180px] pb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerSlow}
          className="flex flex-col items-center gap-4 sm:gap-4"
        >
          <motion.div variants={maskUp}>
            <span className="inline-block text-primary font-semibold text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase">
              Mobile Golf Simulator Rental
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : "-100vw", rotate: prefersReducedMotion ? 0 : -720 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.4 : 1.4, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="flex justify-center min-h-[150px] sm:min-h-[180px] lg:min-h-[220px]"
          >
            <h1 className="sr-only">One More Swing — Premium Mobile Golf Simulator Rental</h1>
            <div className="relative group mx-auto mb-2 sm:mb-4">
              <div className="absolute inset-0 bg-[#050505]/40 blur-2xl rounded-full -z-10" />
              <img
                src={logoImage}
                alt="One More Swing"
                className="h-[150px] sm:h-[180px] lg:h-[220px] w-[150px] sm:w-[180px] lg:w-[220px] object-cover rounded-full bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                data-testid="img-hero-logo"
              />
              <div className="absolute inset-0 bg-primary/20 blur-[32px] rounded-full -z-10 opacity-30 md:group-hover:opacity-100 transition-opacity duration-1000" />
            </div>
          </motion.div>

          <motion.p
            variants={maskUp}
            className="mx-auto font-light relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center"
            style={{
              fontSize: "clamp(12px, 3.6vw, 17px)",
              lineHeight: 1.5,
              letterSpacing: 0,
              width: "min(90vw, 480px)",
              color: "rgba(255,255,255,0.72)",
              textWrap: "initial",
            }}
          >
            <span className="block whitespace-nowrap">Most event entertainment is a distraction.</span>
            <span className="block whitespace-nowrap mt-[-1px]">
              One More Swing is a{" "}
              <span className="text-primary font-semibold">destination</span>.
            </span>
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 mt-6 w-full max-w-[280px] sm:max-w-[320px] mx-auto px-2">
            <Magnetic>
              <Button
                size="lg"
                className="btn-press btn-cta-glow w-full h-[52px] sm:h-[56px] px-8 rounded-full flex items-center justify-center"
                onClick={() => onOpenBooking()}
                data-testid="button-hero-book"
                style={{ background: "linear-gradient(150deg, #15803d 0%, #22c55e 100%)", border: "none" }}
              >
                <span className="text-white text-[15px] sm:text-base font-semibold tracking-[0.04em]">
                  Book Your Event
                </span>
              </Button>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about-section" className="py-14 sm:py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerSlow}
          className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          <motion.div variants={maskUp} className="lg:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="space-y-3">
              <span className="text-primary font-semibold text-[11px] tracking-[0.22em] uppercase block">
                Our Story
              </span>
              <h2
                className="font-serif font-bold text-white"
                style={{
                  fontSize: "clamp(2rem, 5.5vw, 4rem)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.0,
                }}
              >
                About
                <br />
                One More Swing
              </h2>
            </div>
            <p className="text-white/50 text-[15px] sm:text-base max-w-md lg:max-w-none" style={{ lineHeight: 1.8, marginBottom: "1.75rem" }}>
              What started as a simple idea, bringing people together through the love of golf, is now becoming a reality. At One More Swing, we believe some of the best moments happen between swings: the laughs after a missed shot, the friendly competition, the "just one more try" that turns into an unforgettable memory.
            </p>
            <p className="text-white/50 text-[15px] sm:text-base max-w-md lg:max-w-none" style={{ lineHeight: 1.8, marginBottom: "1.25rem" }}>
              Based in Southern California, One More Swing delivers a fully immersive golf simulator setup designed for:
            </p>
            <div className="flex justify-center lg:justify-start">
              <ul className="space-y-2 list-none p-0 m-0 inline-flex flex-col items-start">
                {[
                  "Corporate gatherings",
                  "Private parties",
                  "Community celebrations",
                  "Any special occasion you want to elevate",
                ].map((item, i) => (
                  <li key={i} className="text-white/50 text-[15px] sm:text-base flex items-center gap-3" style={{ lineHeight: 1.8 }}>
                    <span className="block w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-white/50 text-[15px] sm:text-base max-w-md lg:max-w-none" style={{ lineHeight: 1.8, marginBottom: "1.25rem" }}>
              Whether your guests are seasoned golfers or picking up a club for the very first time, our setup is designed to be welcoming, professional, and most importantly, fun.
            </p>
            <p className="text-white/50 text-[15px] sm:text-base max-w-md lg:max-w-none" style={{ lineHeight: 1.8, marginBottom: 0 }}>
              From the first swing to the last cheer, One More Swing creates moments people will talk about long after the event ends. Sometimes all it takes is one more swing.
            </p>
          </motion.div>

          <motion.div variants={scaleIn} className="lg:col-span-7 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.5)] lg:ml-8 lg:-mr-8">
              <img
                src={simFrontImage}
                alt="One More Swing mobile golf simulator setup"
                className="w-full h-auto block"
                loading="lazy"
                data-testid="img-about"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const techFeatures = [
  {
    icon: Target,
    title: "Home Tee Hero Software",
    description: "Garmin's virtual golf course software that lets you play real, mapped-out courses in a video game style environment.",
  },
  {
    icon: Monitor,
    title: "GSPro Premium Software",
    description: "Hyper-realistic 4K course play across 2,000+ courses. GSPro's library is entirely user-created and includes both real-world recreations and fantasy designs.",
  },
  {
    icon: ShieldCheck,
    title: "Performance Bay",
    description: "A 15x15x11 ft hitting bay for maximum safety and style. Allowing you to swing securely and freely.",
  },
  {
    icon: Trophy,
    title: "Equipment",
    description: "Premium golf balls, clubs for right handed/left handed players, and kids clubs available upon request.",
  },
];

function TechSection() {
  return (
    <section id="services-section" className="py-14 sm:py-24 lg:py-32 bg-[#030303]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-6 sm:mb-10 lg:mb-16"
        >
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-4"
            style={{
              fontSize: "clamp(2rem, 5.5vw, 4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
            }}
          >
            The Experience
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {techFeatures.map((feature, index) => (
            <motion.div key={index} variants={maskUp}>
              <MouseGlowCard
                className="group relative bg-[#0c0c0c] border border-white/[0.07] p-6 sm:p-7 h-full rounded-2xl text-center shadow-[0_1px_12px_rgba(0,0,0,0.35)] md:hover:-translate-y-1 md:hover:border-white/[0.12] transition-all duration-300"
              >
                <div data-testid={`card-tech-${index}`} className="flex flex-col h-full items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-white text-[15px] sm:text-base tracking-[-0.01em] leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-white/45 text-[13px] sm:text-[14px]" style={{ lineHeight: 1.65, marginBottom: 0 }}>
                    {feature.description}
                  </p>
                </div>
              </MouseGlowCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section >
  );
}

function PricingSection({ onOpenBooking, onOpenQuote }: { onOpenBooking: (pkg?: string) => void; onOpenQuote: () => void; }) {

  return (
    <section id="booking-section" className="py-14 sm:py-24 lg:py-32 pb-20 sm:pb-32 lg:pb-48 bg-[#030303] overflow-visible">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 overflow-visible">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-6 sm:mb-10 lg:mb-16"
        >
          <motion.span variants={maskUp} className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block">
            Tailored For You
          </motion.span>
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-3 pb-2 sm:pb-4 overflow-visible"
            style={{
              fontSize: "clamp(2rem, 5.5vw, 4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
            }}
          >
            Packages & Pricing
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-[760px] mx-auto"
        >
          <motion.div variants={fadeUp} className="relative z-10">
            <MouseGlowCard
              className="relative overflow-hidden rounded-2xl p-6 sm:p-10 bg-[#0c0c0c] border border-white/[0.09] backdrop-blur-sm shadow-[0_12px_60px_rgba(0,0,0,0.6)] md:hover:-translate-y-[4px] md:hover:border-white/[0.14] transition-all duration-300"
            >
              <div data-testid="card-package-executive" className="flex flex-col gap-6 sm:gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-primary/80 tracking-[0.25em] uppercase border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full inline-block">
                    {packages[0].tag}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                    {packages[0].title}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg font-bold text-white/15 tracking-tight line-through">${packages[0].originalHourlyRate}</span>
                    <span className="text-4xl sm:text-6xl font-bold text-white tracking-tight">${packages[0].hourlyRate}</span>
                    <span className="text-white/25 text-[11px] uppercase tracking-wider">{packages[0].priceUnit}</span>
                  </div>
                  <p className="text-white/40 text-[13px] font-medium">
                    Starting at <span className="text-white/70">${startingAt(packages[0])}</span> per event · {packages[0].minimumHours} hour minimum
                  </p>
                  <span className="text-[10px] font-semibold text-primary tracking-[0.15em] uppercase block">
                    {packages[0].promo}
                  </span>
                </div>

                <div className="w-full h-px bg-white/[0.06]" />

                <ul className="space-y-3.5">
                  {packages[0].features.map((item, i) => (
                    <li key={i} className="flex items-start gap-3.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <span className="text-white/70 text-[14px] sm:text-[15px]" style={{ lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Magnetic>
                    <Button
                      onClick={() => onOpenBooking('executive')}
                      className="btn-press w-full h-[52px] sm:h-[56px] text-white text-[15px] font-semibold rounded-2xl tracking-[0.02em]"
                      data-testid="button-book-executive"
                      style={{ background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)", border: "none" }}
                    >
                      Reserve Your Date
                    </Button>
                  </Magnetic>
                </div>
              </div>
            </MouseGlowCard>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-4 sm:mt-6 relative z-10">
            <MouseGlowCard
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-[#0c0c0c] border border-white/[0.07] backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.4)] md:hover:-translate-y-1 md:hover:border-white/[0.12] transition-all duration-300"
            >
              <div data-testid="card-package-allday" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-primary/80 tracking-[0.25em] uppercase border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full inline-block">
                    All Day
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                    Full Event Coverage
                  </h3>
                </div>

                <Button
                  onClick={() => onOpenQuote()}
                  onTouchEnd={(e) => { e.preventDefault(); onOpenQuote(); }}
                  variant="outline"
                  className="btn-press w-full sm:w-auto h-[52px] sm:h-[56px] sm:px-10 border border-white/10 text-white/70 bg-white/[0.03] text-[14px] font-medium rounded-2xl hover:bg-white/[0.07] hover:text-white hover:border-white/20"
                  data-testid="button-book-allday"
                  style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                >
                  Get a Quote
                </Button>
              </div>
            </MouseGlowCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


const faqItems = [
  {
    question: "What types of events do you service?",
    answer: "We provide the simulator experience for corporate events, private parties, weddings, brand activations, fundraisers, and community events. Our setup is designed to work in a variety of environments and can be tailored to match the style and size of your event.",
  },
  {
    question: "Do guests need golf experience?",
    answer: "Not at all. The simulator is designed to be fun and accessible for everyone. Guests can play famous courses, try closest-to-the-pin challenges, or longest drive contests, making it enjoyable for beginners and experienced golfers alike.",
  },
  {
    question: "How much space is required for setup?",
    answer: "Minimum of 18x18x12 ft space, a flat surface, and access to a standard power source.",
  },
  {
    question: "Can the simulator be set up indoors or outdoors?",
    answer: "Yes. Our setup works both indoors and outdoors as long as the space meets the size requirements and is protected from extreme weather conditions.",
  },
  {
    question: "What happens if it rains or the weather changes?",
    answer: "If your event is outdoors and weather becomes an issue, we'll work with you to adjust the setup location or timing whenever possible. Our goal is to ensure your guests still have a great experience.",
  },
  {
    question: "What does the setup include?",
    answer: "Every booking includes the full simulator enclosure, impact screen, projector, launch monitor, golf mat, and software. Our team handles delivery, setup, calibration, and management during the event.",
  },
  {
    question: "How long does setup take?",
    answer: "Setup typically takes about 45–60 minutes depending on the space. Our team arrives early to ensure everything is ready before guests begin playing.",
  },
  {
    question: "Can I use my own golf clubs?",
    answer: "Yes. Guests are welcome to use their own clubs if they prefer. We also provide clubs so everyone at the event can participate.",
  },
  {
    question: "How many guests can participate?",
    answer: "The simulator works well for both small gatherings and larger events. Guests rotate through turns and we can run challenges like closest-to-the-pin or longest drive competitions to keep everyone engaged.",
  },
  {
    question: "How far in advance should I reserve my event date?",
    answer: "We recommend reserving your event as early as possible, especially for weekends and peak seasons. However, we'll always do our best to accommodate last-minute bookings if availability allows.",
  },
];

function FAQItem({ item, index, isOpen, onToggle }: { item: typeof faqItems[0]; index: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      variants={maskUp}
      className={`border rounded-2xl px-4 sm:px-6 transition-all duration-300 ${isOpen
        ? "bg-white/[0.04] border-primary/20"
        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.1]"
        }`}
      data-testid={`faq-item-${index}`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left gap-4 min-h-[56px] active:scale-[0.98] transition-transform duration-150"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-[15px] sm:text-[17px] font-medium text-white leading-relaxed">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="shrink-0 text-primary"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.3, ease: "easeInOut" } }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: 4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 4, opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="text-[14px] sm:text-[15px] pb-5"
              style={{ lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}
            >
              {item.answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq-section" className="py-14 sm:py-24 lg:py-32 bg-[#050505]" data-testid="section-faq">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          <motion.div variants={maskUp} className="text-center mb-8 sm:mb-12 lg:mb-14">
            <span className="text-primary font-semibold text-[11px] tracking-[0.22em] uppercase block mb-4">
              Common Questions
            </span>
            <h2
              className="font-serif font-bold text-white"
              style={{
                fontSize: "clamp(2rem, 5.5vw, 4rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
              }}
            >
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div variants={maskUp} className="text-center mt-10 sm:mt-14 lg:mt-16 space-y-5">
            <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed">
              Still have questions? We're happy to help.<br />
              Reach out anytime and we'll get back to you shortly.
            </p>
            <button
              onClick={() => scrollToSection("contact-section")}
              className="btn-press inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] hover:border-white/[0.16] text-white/80 text-[12px] sm:text-[13px] font-semibold tracking-[0.1em] uppercase min-h-[52px]"
              data-testid="faq-contact-cta"
            >
              Contact Us
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ onOpenBooking }: { onOpenBooking: (pkg?: string) => void }) {
  return (
    <footer id="contact-section" className="bg-[#020202] border-t border-white/[0.04] pt-12 pb-8 sm:pt-20 lg:pt-24 sm:pb-16" data-testid="footer">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* Zone C: Get In Touch (Primary) */}
          <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
            <h4 className="text-[11px] font-semibold text-primary tracking-[0.22em] uppercase text-center">
              Get In Touch
            </h4>
            <address className="not-italic flex flex-col gap-3 sm:gap-4">
              <a
                href="mailto:info@onemoreswing.golf"
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300 min-h-[68px]"
                data-testid="footer-contact-email"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Mail className="w-[18px] h-[18px] text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-semibold">Email Us</span>
                  <span className="text-white/80 text-[15px] sm:text-base font-medium">info@onemoreswing.golf</span>
                </div>
              </a>

              <a
                href="tel:+17602169598"
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300 min-h-[68px]"
                data-testid="footer-contact-phone"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Phone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-semibold">Text / Call Us</span>
                  <span className="text-white/80 text-[15px] sm:text-base font-medium">760-216-9598</span>
                </div>
              </a>

              <a
                href="https://www.instagram.com/onemoreswing_/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300 min-h-[68px]"
                data-testid="footer-contact-instagram"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Instagram className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-semibold">Follow Us</span>
                  <span className="text-white/80 text-[15px] sm:text-base font-medium">@onemoreswing_</span>
                </div>
              </a>
            </address>
          </div>

          {/* Zone B: Quick Links (Secondary) */}
          <div className="order-2 lg:order-1 space-y-6 sm:space-y-8 lg:pt-2">
            <h4 className="text-[11px] font-semibold tracking-[0.22em] uppercase text-center text-primary">
              Quick Links
            </h4>
            <nav className="flex flex-col items-center">
              {[
                { label: "About Us", id: "about-section" },
                { label: "Experience", id: "services-section" },
                { label: "Packages", id: "booking-section" },
                { label: "FAQ", id: "faq-section" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="link-subtle text-white/30 text-[13px] text-center hover:text-white/70 transition-colors duration-200 py-2.5 w-full min-h-[44px] flex items-center justify-center"
                  data-testid={`link-footer-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollToSection("booking-section")}
                className="link-subtle text-white/30 text-[13px] text-center hover:text-white/70 transition-colors duration-200 py-2.5 w-full min-h-[44px] flex items-center justify-center"
                data-testid="link-footer-booking"
              >
                Book Event
              </button>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/[0.04] mt-12 sm:mt-20 lg:mt-24 pt-6 sm:pt-8 text-center">
          <p className="text-white/10 text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-medium">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const openBooking = useCallback((pkg?: string) => {
    if (pkg) {
      setLocation(`/book?package=${pkg}`);
    } else {
      setLocation("/book");
    }
  }, [setLocation]);

  // Hash scroll is now handled globally in App.tsx

  return (
    <div className="min-h-dvh bg-[#050505] overflow-x-hidden safe-area-bottom">
      <div className="film-grain" />
      <Header onOpenBooking={openBooking} />
      <HeroSection onOpenBooking={openBooking} />
      <AboutSection />
      <TechSection />
      <PricingSection onOpenBooking={openBooking} onOpenQuote={() => setIsQuoteOpen(true)} />
      <FAQSection />
      <Footer onOpenBooking={openBooking} />
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
}
