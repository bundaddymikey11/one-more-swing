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
import logoImage from "@assets/Logo_1771044908308.png";
import simFrontImage from "@assets/one_more_swing_web_3_1772081755924.jpg";
import simAngleImage from "@assets/one_more_swing_web_2_1772081755925.jpg";
import simSideImage from "@assets/one_more_swing_web_1_1772081755925.jpg";

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
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="bg-primary/90 backdrop-blur-sm py-3 sm:py-2.5 text-center cursor-pointer min-h-[44px] flex items-center justify-center"
      data-testid="banner-scarcity"
      onClick={() => scrollTo("packages")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") scrollTo("packages"); }}
    >
      <p className="text-white text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase px-5 sm:px-4 leading-relaxed">
        Be Among the First to Host One More Swing at Your Next Event
      </p>
    </motion.div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
        scrolled ? "bg-[#000000]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <AnnouncementBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-[56px] sm:h-20">
          <nav className="hidden md:flex items-center gap-8" data-testid="nav-desktop">
            {[
              { label: "About", id: "about" },
              { label: "Experience", id: "tech" },
              { label: "Packages", id: "packages" },
              { label: "Book", id: "booking" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase hover-elevate px-2 py-1 rounded-md"
                data-testid={`link-nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/contact"
              className="text-[11px] font-medium text-white/50 tracking-[0.2em] uppercase hover-elevate px-2 py-1 rounded-md"
              data-testid="link-nav-contact"
            >
              Contact
            </Link>
          </nav>

          <Button
            onClick={() => scrollTo("booking")}
            className="bg-primary text-primary-foreground border border-primary-border shrink-0 btn-glow min-h-[44px] sm:h-auto"
            data-testid="button-header-book"
          >
            <span className="hidden sm:inline">Inquire Now</span>
            <span className="sm:hidden text-sm">Inquire</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="hero" ref={heroRef} className="relative min-h-dvh flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
      <motion.div className="absolute inset-0" style={{ y: heroY }}>
        <img
          src="/images/hero-socal.png"
          alt="Southern California luxury golf lifestyle"
          className="w-full h-[120%] object-cover"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/40 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 text-center pt-24 sm:pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerSlow}
          className="space-y-5 sm:space-y-8"
        >
          <motion.div variants={maskUp}>
            <span className="inline-block text-primary font-semibold text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase">
              Mobile Golf Simulator Rental
            </span>
          </motion.div>

          <motion.div variants={maskUp} className="flex justify-center">
            <h1 className="sr-only">One More Swing — Premium Mobile Golf Simulator Rental</h1>
            <img
              src={logoImage}
              alt="One More Swing"
              className="h-28 sm:h-48 lg:h-56 w-auto object-contain"
              data-testid="img-hero-logo"
            />
          </motion.div>

          <motion.p
            variants={maskUp}
            className="text-white/60 max-w-[34ch] sm:max-w-2xl mx-auto text-[15px] sm:text-base"
            style={{
              lineHeight: 1.8,
              letterSpacing: "0.02em",
            }}
          >
            Most event entertainment is a distraction.
            <br className="hidden sm:block" />
            One More Swing is a <span className="text-primary font-bold">destination</span>.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => scrollTo("booking")}
              className="w-full sm:w-auto min-h-[48px] sm:h-auto bg-primary text-primary-foreground border border-primary-border text-base px-10 btn-glow"
              data-testid="button-hero-book"
            >
              Inquire Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("packages")}
              className="w-full sm:w-auto min-h-[48px] sm:h-auto text-base px-10 bg-white/5 backdrop-blur-sm border-white/15 text-white"
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
            onClick={() => scrollTo("about")}
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
            <p className="text-white/50 text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: "1.75rem" }}>
              What started as a simple idea, bringing people together through the love of golf, is now becoming a reality. At One More Swing, we believe some of the best moments happen between swings: the laughs after a missed shot, the friendly competition, the "just one more try" that turns into an unforgettable memory.
            </p>
            <p className="text-white/50 text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: "1.25rem" }}>
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
                  <li key={i} className="text-white/50 text-[14px] sm:text-base flex items-center gap-3" style={{ lineHeight: 1.7 }}>
                    <span className="block w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-white/50 text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Whether your guests are seasoned golfers or picking up a club for the very first time, our setup is designed to be welcoming, professional, and most importantly, fun.
            </p>
            <p className="text-white/50 text-[14px] sm:text-base" style={{ lineHeight: 1.7, marginBottom: 0 }}>
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
            <div className="grid grid-cols-2 gap-3 mt-3 lg:ml-12 lg:-mr-8">
              <div className="relative rounded-md overflow-hidden border border-white/[0.08]">
                <img
                  src={simAngleImage}
                  alt="Golf simulator angle view"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                  data-testid="img-about-angle"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/50 via-transparent to-transparent" />
              </div>
              <div className="relative rounded-md overflow-hidden border border-white/[0.08]">
                <img
                  src={simSideImage}
                  alt="Golf simulator side view"
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                  data-testid="img-about-side"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/50 via-transparent to-transparent" />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-28 h-28 sm:w-40 sm:h-40 border border-primary/8 rounded-md hidden lg:block" />
            <div className="absolute -top-4 -right-4 w-20 h-20 border border-white/5 rounded-md hidden lg:block" />
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
    description: "A 15x15x11 ft hitting bay for maximum safety and style. Allowing you to swing securely and freely.\n\nRequirements: minimum of 18x18x12 ft space, a flat surface, and access to a standard power source.",
  },
  {
    icon: Trophy,
    title: "Equipment",
    description: "Kids clubs available upon request.",
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
                <p className="text-white/40 text-[13px] whitespace-pre-line" style={{ lineHeight: 1.7, marginBottom: 0 }}>
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

function PricingSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
                  onClick={() => scrollTo("booking")}
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
                  onClick={() => scrollTo("booking")}
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


function BookingSection() {
  const { toast } = useToast();
  const [customEventType, setCustomEventType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      name: "",
      email: "",
      eventDate: "",
      eventType: "",
      startTime: "",
      location: "",
      message: "",
    },
  });

  const watchedEventType = form.watch("eventType");

  const mutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      const submitData = { ...data };
      if (submitData.eventType === "other_special_occasion" && customEventType) {
        submitData.eventType = `Other Special Occasion: ${customEventType}`;
      }
      const res = await apiRequest("POST", "/api/bookings", submitData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent",
        description: "We'll be in touch within 24 hours to confirm your event details.",
      });
      form.reset();
      setCustomEventType("");
      setSelectedDate(undefined);
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
    <section id="booking" className="py-12 sm:py-20 lg:py-28 bg-[#030303]">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
        >
          <motion.div variants={maskUp} className="text-center mb-8 sm:mb-14">
            <div className="inline-block mb-4">
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase bg-primary/8 text-primary px-3 sm:px-4 py-2 rounded-md border border-white/[0.06] leading-relaxed inline-block"
                data-testid="badge-urgency"
              >
                Be Among the First to Host One More Swing at Your Next Event
              </span>
            </div>

            <motion.div
              variants={maskUp}
              className="mb-5 sm:mb-6"
              data-testid="badge-slots"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/[0.03] border border-white/[0.08] rounded-md px-4 sm:px-5 py-2.5">
                <span className="font-mono text-primary text-lg sm:text-xl font-bold tracking-[0.1em]" data-testid="text-slots-counter">
                  04<span className="text-white/20 mx-0.5">/</span>05
                </span>
                <span className="text-white/40 text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium">
                  Slots Remaining
                </span>
              </div>
            </motion.div>

            <div>
              <span className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase">
                Reserve Your Date
              </span>
            </div>
            <h2
              className="font-serif font-bold text-white mt-3"
              style={{
                fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
                letterSpacing: "-0.05em",
                lineHeight: 0.95,
              }}
            >
              Book Your Event
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mt-4 text-sm sm:text-base" style={{ lineHeight: 1.8 }}>
              Tell us about your event and we'll craft the perfect experience
            </p>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card
              className="bg-white/[0.02] border-white/[0.06] p-5 sm:p-8 lg:p-10 rounded-lg"
              data-testid="card-booking-form"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Smith"
                              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                              data-testid="input-name"
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
                          <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Event Date</FormLabel>
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full justify-start text-left font-normal bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] h-9 ${
                                    !field.value ? "text-white/20" : "text-white"
                                  }`}
                                  data-testid="input-date"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-white/40" />
                                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Pick a date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0a0a0a] border-white/10" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  setSelectedDate(date);
                                  if (date) {
                                    field.onChange(format(date, "yyyy-MM-dd"));
                                  }
                                  setCalendarOpen(false);
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Start Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger
                                className="bg-white/[0.03] border-white/[0.08] text-white"
                                data-testid="select-start-time"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-white/40" />
                                  <SelectValue placeholder="Select time" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time} data-testid={`option-time-${time.replace(/\s/g, "-").toLowerCase()}`}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Event Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger
                              className="bg-white/[0.03] border-white/[0.08] text-white"
                              data-testid="select-event-type"
                            >
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="corporate" data-testid="option-corporate">Corporate</SelectItem>
                            <SelectItem value="birthday" data-testid="option-birthday">Birthday</SelectItem>
                            <SelectItem value="wedding" data-testid="option-wedding">Wedding</SelectItem>
                            <SelectItem value="grand_opening" data-testid="option-grand-opening">Grand Opening</SelectItem>
                            <SelectItem value="community_celebration" data-testid="option-community">Community Celebration</SelectItem>
                            <SelectItem value="other_special_occasion" data-testid="option-other">Other Special Occasion</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedEventType === "other_special_occasion" && (
                    <div>
                      <label className="text-white/60 text-xs uppercase tracking-[0.1em] block mb-2">
                        Describe Your Event
                      </label>
                      <Input
                        placeholder="Tell us about your special occasion"
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                        data-testid="input-custom-event-type"
                        value={customEventType}
                        onChange={(e) => setCustomEventType(e.target.value)}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">
                          Location <span className="text-white/20">(City or Zip Code)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Los Angeles, CA or 90210"
                            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                            data-testid="input-location"
                            {...field}
                            value={field.value || ""}
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
                        <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">
                          Additional Details <span className="text-white/20">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your event, expected number of guests, location, etc."
                            rows={4}
                            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40 resize-none"
                            data-testid="textarea-message"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className={`w-full min-h-[48px] sm:h-auto bg-primary text-primary-foreground border border-primary-border text-base btn-glow ${mutation.isPending ? "btn-ball-loader" : ""}`}
                    size="lg"
                    data-testid="button-submit-booking"
                  >
                    {mutation.isPending ? (
                      <span role="status" aria-live="polite">
                        <span className="btn-ball" aria-hidden="true" />
                        <span className="btn-hole" aria-hidden="true" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#020202] border-t border-white/[0.04] py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-semibold text-white/40 tracking-[0.25em] uppercase">
              Quick Links
            </h4>
            <div className="flex flex-col gap-1">
              {[
                { label: "About Us", id: "about" },
                { label: "Experience", id: "tech" },
                { label: "Packages", id: "packages" },
                { label: "Book Event", id: "booking" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-white/30 text-[13px] text-left hover-elevate px-2 py-2 sm:py-1 rounded-md min-h-[44px] sm:min-h-0 flex items-center"
                  data-testid={`link-footer-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
              <Link
                href="/contact"
                className="text-white/30 text-[13px] text-left hover-elevate px-2 py-2 sm:py-1 rounded-md min-h-[44px] sm:min-h-0 flex items-center"
                data-testid="link-footer-contact"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-semibold text-white/40 tracking-[0.25em] uppercase">
              Get In Touch
            </h4>
            <div className="flex flex-col gap-2 sm:gap-3">
              <a href="mailto:info@onemoreswing.golf" className="flex items-center gap-3 min-h-[44px] sm:min-h-0" data-testid="text-email">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-white/30 text-[13px]">info@onemoreswing.golf</span>
              </a>
              <a href="tel:+17602169598" className="flex items-center gap-3 min-h-[44px] sm:min-h-0" data-testid="text-phone">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-white/30 text-[13px]">760-216-9598</span>
              </a>
              <a
                href="https://www.instagram.com/onemoreswing_/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 min-h-[44px] sm:min-h-0"
                data-testid="link-instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-white/30 text-[13px]">@onemoreswing_</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] mt-8 sm:mt-10 pt-6 sm:pt-8 text-center">
          <p className="text-white/20 text-[11px] tracking-wider">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#050505] overflow-x-hidden safe-area-bottom">
      <div className="film-grain" />
      <Header />
      <HeroSection />
      <AboutSection />
      <TechSection />
      <PricingSection />
      <BookingSection />
      <Footer />
    </div>
  );
}
