import { motion, useScroll, useTransform } from "framer-motion";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { Link } from "wouter";
import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { scrollToSection } from "@/lib/scrollTo";
import logoImage from "@assets/Logo_1771044908308.png";
import simFrontImage from "@assets/Untitled_1772248722147.PNG";

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const staggerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] } },
};

const timeSlots = [
  "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM",
];

function AnnouncementBar() {
  return (
    <motion.div
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="w-screen bg-primary/90 backdrop-blur-sm py-3 sm:py-2.5 text-center cursor-pointer min-h-[44px] flex items-center justify-center"
      data-testid="banner-scarcity"
      onClick={() => scrollToSection("packages")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") scrollToSection("packages"); }}
    >
      <p className="text-white text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase px-5 sm:px-4 leading-relaxed">
        Be Among the First to Host One More Swing at Your Next Event
      </p>
    </motion.div>
  );
}

function Header({ onOpenBooking }: { onOpenBooking: () => void }) {
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
      className={`fixed top-0 left-0 w-screen overflow-x-hidden z-[999] transition-all duration-500 ${
        scrolled ? "bg-[#000000]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
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
              { label: "About", id: "about" },
              { label: "Experience", id: "tech" },
              { label: "Packages", id: "packages" },
              { label: "FAQ", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase hover-elevate px-3 py-2 rounded-md hover:text-white/90 transition-colors duration-300 min-h-[44px] flex items-center"
                data-testid={`link-nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={onOpenBooking}
              className="text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase hover-elevate px-3 py-2 rounded-md hover:text-white/90 transition-colors duration-300 min-h-[44px] flex items-center"
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

function HeroSection({ onOpenBooking }: { onOpenBooking: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="hero" ref={heroRef} className="relative min-h-[88dvh] sm:min-h-dvh flex flex-col items-center justify-start overflow-hidden" style={{ position: "relative" }}>
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

          <motion.div variants={maskUp} className="flex justify-center">
            <h1 className="sr-only">One More Swing — Premium Mobile Golf Simulator Rental</h1>
            <div className="relative group">
              <img
                src={logoImage}
                alt="One More Swing"
                className="h-[150px] sm:h-[200px] lg:h-[220px] w-[150px] sm:w-[200px] lg:w-[220px] object-cover rounded-full bg-black/40 backdrop-blur-sm"
                data-testid="img-hero-logo"
              />
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          </motion.div>

          <motion.p
            variants={maskUp}
            className="text-white/65 max-w-[320px] sm:max-w-2xl mx-auto text-[15px] sm:text-base"
            style={{
              lineHeight: 1.8,
              letterSpacing: "0.02em",
            }}
          >
            Most event entertainment is a distraction.
            <br className="hidden sm:block" />
            One More Swing is a <span className="text-primary font-bold">destination</span>.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-5 w-full max-w-[320px] sm:max-w-none mx-auto">
            <Button
              size="lg"
              onClick={onOpenBooking}
              className="w-full sm:w-auto h-[52px] sm:h-[54px] bg-primary text-primary-foreground border border-primary-border text-base px-10 btn-glow"
              data-testid="button-hero-book"
            >
              Inquire Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("packages")}
              className="w-full sm:w-auto h-[52px] sm:h-[54px] text-base px-10 bg-white/5 backdrop-blur-sm border-white/15 text-white"
              data-testid="button-hero-packages"
            >
              View Packages
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={() => scrollToSection("about")}
            aria-label="Scroll to About section"
            className="text-white/30 animate-bounce min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-testid="button-scroll-down"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-20 lg:py-28 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerSlow}
          className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-center"
        >
          <motion.div variants={maskUp} className="lg:col-span-5 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <span className="text-primary font-semibold text-sm tracking-[0.25em] uppercase block">
                Our Story
              </span>
              <h2
                className="font-serif font-bold text-white"
                style={{
                  fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                }}
              >
                About
                <br />
                One More Swing
              </h2>
            </div>
            <p className="text-white/[0.55] text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: "1.75rem" }}>
              What started as a simple idea, bringing people together through the love of golf, is now becoming a reality. At One More Swing, we believe some of the best moments happen between swings: the laughs after a missed shot, the friendly competition, the "just one more try" that turns into an unforgettable memory.
            </p>
            <p className="text-white/[0.55] text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: "1.25rem" }}>
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
                  <li key={i} className="text-white/[0.55] text-[14px] sm:text-base flex items-center gap-3" style={{ lineHeight: 1.7 }}>
                    <span className="block w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-white/[0.55] text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Whether your guests are seasoned golfers or picking up a club for the very first time, our setup is designed to be welcoming, professional, and most importantly, fun.
            </p>
            <p className="text-white/[0.55] text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: 0 }}>
              From the first swing to the last cheer, One More Swing creates moments people will talk about long after the event ends. Sometimes all it takes is one more swing.
            </p>
          </motion.div>

          <motion.div variants={scaleIn} className="lg:col-span-7 relative">
            <div className="relative rounded-md overflow-hidden border border-white/[0.08] lg:ml-12 lg:-mr-8">
              <img
                src={simFrontImage}
                alt="One More Swing mobile golf simulator setup"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
                data-testid="img-about"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
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
    <section id="tech" className="py-12 sm:py-20 lg:py-28 bg-[#030303]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-8 sm:mb-16"
        >
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-4"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
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
              <Card
                className="group relative bg-white/[0.02] border-white/[0.06] p-5 sm:p-7 h-full hover-elevate rounded-lg text-center"
                data-testid={`card-tech-${index}`}
              >
                <div className="w-10 h-10 rounded-md bg-primary/8 border border-white/[0.06] flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/[0.45] text-[13px] whitespace-pre-line" style={{ lineHeight: 1.7, marginBottom: 0 }}>
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection({ onOpenBooking }: { onOpenBooking: () => void }) {

  return (
    <section id="packages" className="py-12 sm:py-20 lg:py-28 bg-[#030303]">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-8 sm:mb-16"
        >
          <motion.span variants={maskUp} className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block">
            Tailored For You
          </motion.span>
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-3"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
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
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          <motion.div variants={maskUp}>
            <div
              className="relative pricing-card rounded-lg p-5 sm:p-8 h-full"
              data-testid="card-package-executive"
            >
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-primary tracking-[0.25em] uppercase">
                    Executive
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                    Hourly Rental
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-lg sm:text-2xl font-bold text-white/20 tracking-tight line-through">$250</span>
                    <span className="text-3xl sm:text-5xl font-bold text-white tracking-tight">$225</span>
                    <span className="text-white/30 text-xs uppercase tracking-wider">/hour</span>
                  </div>
                  <span className="text-[10px] font-semibold text-primary tracking-[0.15em] uppercase block">
                    First 5 bookings only
                  </span>
                </div>

                <div className="w-full h-px bg-white/[0.06]" />

                <ul className="space-y-2.5">
                  {[
                    "3-hour minimum",
                    "Choose between Home Tee Hero or GSPro Software",
                    "On-site setup & management",
                    "All necessary equipment included",
                    "Additional Hours: $200 per extra hour if available",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Star className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-white/60 text-[13px] sm:text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={onOpenBooking}
                  className="w-full min-h-[48px] sm:h-auto bg-primary text-primary-foreground border border-primary-border btn-glow text-base"
                  data-testid="button-book-executive"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={maskUp}>
            <div
              className="relative pricing-card rounded-lg p-5 sm:p-8 h-full flex flex-col justify-center"
              data-testid="card-package-allday"
            >
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-primary tracking-[0.25em] uppercase">
                    All Day
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                    Full Event Coverage
                  </h3>
                </div>

                <Button
                  onClick={onOpenBooking}
                  variant="outline"
                  className="w-full min-h-[48px] sm:h-auto border-primary/20 text-primary bg-primary/5 text-base"
                  data-testid="button-book-allday"
                >
                  Get a Quote
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


const faqItems = [
  {
    question: "What types of events do you service?",
    answer: "We specialize in corporate events, birthdays, private parties, community celebrations, weddings, and grand openings. If you have a reason to gather, we have a reason to swing.",
  },
  {
    question: "Do guests need golf experience?",
    answer: "Not at all! Whether someone is a seasoned golfer or picking up a club for the first time, our setup is designed to be fun, welcoming, and easy to enjoy.",
  },
  {
    question: "How much space is required for setup?",
    answer: "We require a flat surface, minimum of 18x18x12 ft space, and access to a standard power source. We're happy to review your location in advance.",
  },
  {
    question: "Can I use my own golf clubs?",
    answer: "Yes, you're welcome to bring your own clubs! We provide standard left- & right-handed clubs with rental, along with kids' clubs upon request.",
  },
  {
    question: "How far in advance should we book?",
    answer: "We recommend booking at least 2 weeks in advance to ensure availability and allow time for proper planning.",
  },
  {
    question: "How do I book One More Swing for my event?",
    answer: "Contact us at info@onemoreswing.golf with your event date, location, and a few details about what you're planning, and we'll confirm availability and walk you through the next steps.",
  },
];

function FAQSection() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#050505]" data-testid="section-faq">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <motion.div variants={maskUp} className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-display">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div variants={maskUp}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-white/[0.06] rounded-xl bg-white/[0.02] px-5 sm:px-6 backdrop-blur-sm"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left text-white/90 text-[15px] sm:text-base font-medium py-5 hover:no-underline hover:text-white">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/50 text-[14px] sm:text-[15px] leading-relaxed pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <footer className="bg-[#020202] border-t border-white/[0.04] pt-16 pb-10 sm:pt-24 sm:pb-16" data-testid="footer">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* Zone C: Get In Touch (Primary) */}
          <div className="order-1 lg:order-2 space-y-6 sm:space-y-8">
            <h4 className="text-[11px] font-bold text-primary tracking-[0.3em] uppercase text-center">
              Get In Touch
            </h4>
            <address className="not-italic flex flex-col gap-3 sm:gap-4">
              <a 
                href="mailto:info@onemoreswing.golf" 
                className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-300 min-h-[64px]"
                data-testid="footer-contact-email"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Email Us</span>
                  <span className="text-white/90 text-base sm:text-lg font-medium">info@onemoreswing.golf</span>
                </div>
              </a>

              <a 
                href="tel:+17602169598" 
                className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-300 min-h-[64px]"
                data-testid="footer-contact-phone"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Call Us</span>
                  <span className="text-white/90 text-base sm:text-lg font-medium">760-216-9598</span>
                </div>
              </a>

              <a 
                href="https://www.instagram.com/onemoreswing_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-300 min-h-[64px]"
                data-testid="footer-contact-instagram"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                  <Instagram className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Follow Us</span>
                  <span className="text-white/90 text-base sm:text-lg font-medium">@onemoreswing_</span>
                </div>
              </a>
            </address>
          </div>

          {/* Zone B: Quick Links (Secondary) */}
          <div className="order-2 lg:order-1 space-y-6 sm:space-y-8 lg:pt-2">
            <h4 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-center text-primary">
              Quick Links
            </h4>
            <nav className="flex flex-col items-center">
              {[
                { label: "About Us", id: "about" },
                { label: "Experience", id: "tech" },
                { label: "Packages", id: "packages" },
                { label: "FAQ", id: "faq" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-white/30 text-[13px] text-center hover:text-white/80 transition-colors duration-300 py-2.5 w-full min-h-[44px] flex items-center justify-center"
                  data-testid={`link-footer-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={onOpenBooking}
                className="text-white/30 text-[13px] text-center hover:text-white/80 transition-colors duration-300 py-2.5 w-full min-h-[44px] flex items-center justify-center"
                data-testid="link-footer-booking"
              >
                Book Event
              </button>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/[0.04] mt-16 sm:mt-24 pt-8 text-center">
          <p className="text-white/10 text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-medium">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => scrollToSection(hash), 400);
    }
  }, []);

  useEffect(() => {
    if (bookingOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingOpen]);

  return (
    <div className="min-h-dvh bg-[#050505] overflow-x-hidden safe-area-bottom">
      <div className="film-grain" />
      <Header onOpenBooking={openBooking} />
      <HeroSection onOpenBooking={openBooking} />
      <AboutSection />
      <TechSection />
      <PricingSection onOpenBooking={openBooking} />
      <FAQSection />
      <Footer onOpenBooking={openBooking} />

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-4xl h-[90dvh] flex flex-col bg-[#0a0a0a] border-white/[0.08] p-0" data-testid="modal-booking" aria-describedby="booking-description">
          <DialogTitle className="sr-only">Book Your Event</DialogTitle>
          <DialogDescription id="booking-description" className="sr-only">Fill out the form to reserve your mobile golf simulator event.</DialogDescription>
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10">
            <div className="text-center mb-8 space-y-3">
              <span className="text-primary font-semibold text-xs tracking-[0.3em] uppercase block">
                Reserve Your Date
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                Bring the course to <span className="text-gradient">your doorstep.</span>
              </h2>
            </div>
            <BookingWizard />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
