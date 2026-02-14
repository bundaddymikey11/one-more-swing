import { motion, useScroll, useTransform, useInView } from "framer-motion";
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
  MapPin,
  Zap,
  Star,
  ArrowRight,
  ChevronDown,
  Mail,
  Award,
  Building2,
  Crosshair,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
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

function AnnouncementBar() {
  return (
    <motion.div
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="bg-primary/90 backdrop-blur-sm py-2.5 text-center"
      data-testid="banner-scarcity"
    >
      <p className="text-white text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase px-4">
        Now Accepting 10 Exclusive Bookings for Our Inaugural Spring Season
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
        <div className="flex items-center justify-between gap-4 h-14 sm:h-20">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center shrink-0"
            data-testid="link-logo"
          >
            <img src={logoImage} alt="One More Swing" className="h-10 w-10 sm:h-14 sm:w-14 rounded-full object-cover" data-testid="img-logo-header" />
          </button>

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
          </nav>

          <Button
            onClick={() => scrollTo("booking")}
            className="bg-primary text-primary-foreground border border-primary-border shrink-0 btn-glow h-10 sm:h-auto"
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
    <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
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

      <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerSlow}
          className="space-y-8 sm:space-y-10"
        >
          <motion.div variants={maskUp}>
            <span className="inline-block text-primary font-semibold text-[10px] sm:text-xs tracking-[0.35em] uppercase">
              Premium Mobile Golf Simulator
            </span>
          </motion.div>

          <motion.h1
            variants={maskUp}
            className="font-serif font-bold text-white"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 7rem)",
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
            }}
          >
            The New Standard
            <br />
            <span className="text-primary">of Entertainment</span>
          </motion.h1>

          <motion.p
            variants={maskUp}
            className="text-white/60 max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.25rem)",
              lineHeight: 1.8,
              letterSpacing: "0.02em",
            }}
          >
            Most event entertainment is a distraction.
            <br className="hidden sm:block" />
            One More Swing is a destination.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => scrollTo("booking")}
              className="w-full sm:w-auto h-14 sm:h-auto bg-primary text-primary-foreground border border-primary-border text-base px-10 btn-glow"
              data-testid="button-hero-book"
            >
              Inquire Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("packages")}
              className="w-full sm:w-auto h-14 sm:h-auto text-base px-10 bg-white/5 backdrop-blur-sm border-white/15 text-white"
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
            className="text-white/30 animate-bounce"
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
    <section id="about" className="py-24 sm:py-40 lg:py-56 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          <motion.div variants={maskUp} className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block">
                The Story
              </span>
              <h2
                className="font-serif font-bold text-white"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                }}
              >
                About
                <br />
                One More Swing
              </h2>
            </div>
            <p className="text-white/50 text-base sm:text-lg" style={{ lineHeight: 1.8 }}>
              Arriving in Southern California, One More Swing brings the excitement of
              the course directly to you. We specialize in fully immersive simulator
              experiences designed for corporate gatherings, private events, and special
              occasions.
            </p>
            <p className="text-white/50 text-base sm:text-lg" style={{ lineHeight: 1.8 }}>
              Whether your guests are scratch golfers or picking up a club for the first
              time, we provide a professional and unforgettable atmosphere anywhere you
              host.
            </p>
            <div className="flex items-center gap-8 pt-6">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary tracking-tight" data-testid="text-stat-courses">200+</div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-2">Courses</div>
              </div>
              <div className="w-px h-14 bg-white/10" />
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary tracking-tight" data-testid="text-stat-4k">4K</div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-2">Resolution</div>
              </div>
              <div className="w-px h-14 bg-white/10" />
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary tracking-tight" data-testid="text-stat-service">5-Star</div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-2">Service</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={scaleIn} className="lg:col-span-7 relative">
            <div className="relative rounded-md overflow-hidden border border-white/[0.08] lg:ml-12 lg:-mr-8">
              <img
                src="/images/hero-golf.png"
                alt="Golf simulator experience"
                className="w-full aspect-[4/3] object-cover"
                data-testid="img-about"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
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
    title: "Garmin R10 Launch Monitor",
    description: "Precise ball and club data for every shot. Track spin rate, launch angle, ball speed, and more with tour-level accuracy.",
  },
  {
    icon: Monitor,
    title: "GSPro Premium Software",
    description: "Hyper-realistic 4K course play across 200+ world-renowned courses. The most immersive golf simulation available.",
  },
  {
    icon: ShieldCheck,
    title: "Luxury Enclosure",
    description: "15x15x11 ft hitting bay for maximum safety and style. Premium materials ensure an elegant and secure environment.",
  },
  {
    icon: Trophy,
    title: "Premium Equipment",
    description: "Titleist RCT balls and clubs for all players. Right-handed, left-handed, and kids' equipment included.",
  },
];

function TechSection() {
  return (
    <section id="tech" className="py-24 sm:py-40 lg:py-56 bg-[#030303]">
      <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-20 sm:mb-28"
        >
          <motion.span variants={maskUp} className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block">
            World-Class Technology
          </motion.span>
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
            }}
          >
            The Experience
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 max-w-xl mx-auto mt-6 text-sm sm:text-base" style={{ lineHeight: 1.8 }}>
            Every detail has been carefully curated to deliver a truly premium experience
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {techFeatures.map((feature, index) => (
            <motion.div key={index} variants={maskUp}>
              <Card
                className="group relative bg-white/[0.02] border-white/[0.06] p-6 sm:p-8 h-full hover-elevate"
                data-testid={`card-tech-${index}`}
              >
                <div className="w-11 h-11 rounded-md bg-primary/8 border border-white/[0.06] flex items-center justify-center mb-5">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-[13px]" style={{ lineHeight: 1.8 }}>
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

const hotspots = [
  { label: "Garmin R10", sublabel: "Launch Monitor", x: "15%", y: "60%", delay: 0.3 },
  { label: "4K Projection", sublabel: "Ultra HD Display", x: "50%", y: "25%", delay: 0.6 },
  { label: "Titleist RCT", sublabel: "Premium Balls", x: "80%", y: "70%", delay: 0.9 },
  { label: "15x15x11", sublabel: "Luxury Enclosure", x: "30%", y: "85%", delay: 1.2 },
];

function FeaturesHotspotSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section className="py-24 sm:py-40 lg:py-56 bg-[#050505]" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-16 sm:mb-24"
        >
          <motion.span variants={maskUp} className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block">
            Inside the Experience
          </motion.span>
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
            }}
          >
            Every Detail, Curated
          </motion.h2>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative rounded-md overflow-hidden border border-white/[0.06]"
          >
            <img
              src="/images/hero-golf.png"
              alt="Premium golf simulator setup"
              className="w-full aspect-[16/9] sm:aspect-[2/1] object-cover"
              data-testid="img-features-hotspot"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-[#050505]/20 to-[#050505]/40" />

            {hotspots.map((spot, i) => (
              <motion.div
                key={i}
                className="absolute hidden sm:flex flex-col items-start"
                style={{ left: spot.x, top: spot.y }}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: spot.delay, ease: [0.25, 0.1, 0.25, 1] }}
                data-testid={`hotspot-${i}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-40" />
                  </div>
                  <div className="bg-[#050505]/80 backdrop-blur-md border border-white/10 rounded-md px-3 py-2">
                    <div className="text-white text-xs font-semibold tracking-tight">{spot.label}</div>
                    <div className="text-white/40 text-[10px] tracking-[0.1em] uppercase">{spot.sublabel}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="sm:hidden grid grid-cols-2 gap-3 mt-6">
            {hotspots.map((spot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-md p-4 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <div>
                  <div className="text-white text-xs font-semibold tracking-tight">{spot.label}</div>
                  <div className="text-white/40 text-[10px] tracking-[0.1em] uppercase">{spot.sublabel}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="packages" className="py-24 sm:py-40 lg:py-56 bg-[#030303]">
      <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
          className="text-center mb-20 sm:mb-28"
        >
          <motion.span variants={maskUp} className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block">
            Tailored For You
          </motion.span>
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white mt-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
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
          className="grid md:grid-cols-2 gap-6 sm:gap-8"
        >
          <motion.div variants={maskUp}>
            <div
              className="relative pricing-card rounded-md p-8 sm:p-10 h-full"
              data-testid="card-package-standard"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-primary tracking-[0.25em] uppercase">
                    Standard
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                    Hourly Rental
                  </h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">$175</span>
                  <span className="text-white/30 text-xs uppercase tracking-wider">/hour</span>
                </div>

                <div className="w-full h-px bg-white/[0.06]" />

                <ul className="space-y-3">
                  {[
                    "2-hour minimum",
                    "Full professional setup",
                    "Onsite technician support",
                    "4K projection system",
                    "All premium equipment included",
                    "Titleist RCT balls & clubs (RH/LH/Kids)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Star className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-white/60 text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => scrollTo("booking")}
                  className="w-full h-14 sm:h-auto bg-primary text-primary-foreground border border-primary-border btn-glow"
                  data-testid="button-book-standard"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={maskUp}>
            <div
              className="relative pricing-card rounded-md p-8 sm:p-10 h-full"
              data-testid="card-package-luxury"
            >
              <div className="absolute top-0 right-0 m-4">
                <span className="text-[10px] font-bold text-primary tracking-[0.25em] uppercase bg-primary/8 px-3 py-1.5 rounded-md border border-white/[0.06]">
                  Premium
                </span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-primary tracking-[0.25em] uppercase">
                    Full-Day
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                    Luxury Experience
                  </h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Custom</span>
                  <span className="text-white/30 text-xs uppercase tracking-wider">pricing</span>
                </div>

                <div className="w-full h-px bg-white/[0.06]" />

                <ul className="space-y-3">
                  {[
                    "Perfect for weddings & corporate events",
                    "Extended support & flexible scheduling",
                    "Dedicated event coordinator",
                    "Custom branding options",
                    "All premium equipment included",
                    "White-glove setup & teardown",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Star className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span className="text-white/60 text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => scrollTo("booking")}
                  variant="outline"
                  className="w-full h-14 sm:h-auto border-primary/20 text-primary bg-primary/5"
                  data-testid="button-book-luxury"
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

function LogisticsSection() {
  return (
    <section className="py-16 sm:py-32 lg:py-40 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 gap-6"
        >
          <motion.div variants={maskUp}>
            <Card
              className="bg-white/[0.02] border-white/[0.06] p-6 sm:p-8 h-full"
              data-testid="card-logistics-space"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md bg-primary/8 border border-white/[0.06] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1 tracking-tight">Space Needed</h3>
                  <p className="text-2xl font-bold text-white mb-2 tracking-tight">16 x 16 x 12 ft</p>
                  <p className="text-white/40 text-[13px]" style={{ lineHeight: 1.8 }}>
                    Minimum clearance for our premium enclosure. We handle all setup and teardown.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={maskUp}>
            <Card
              className="bg-white/[0.02] border-white/[0.06] p-6 sm:p-8 h-full"
              data-testid="card-logistics-power"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md bg-primary/8 border border-white/[0.06] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1 tracking-tight">Power Required</h3>
                  <p className="text-2xl font-bold text-white mb-2 tracking-tight">Standard Outlet</p>
                  <p className="text-white/40 text-[13px]" style={{ lineHeight: 1.8 }}>
                    Just one standard 120V outlet is all we need. No special electrical requirements.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function BookingSection() {
  const { toast } = useToast();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      name: "",
      email: "",
      eventDate: "",
      eventType: "",
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
        title: "Booking Request Sent",
        description: "We'll be in touch within 24 hours to confirm your event details.",
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
    <section id="booking" className="py-24 sm:py-40 lg:py-56 bg-[#030303]">
      <div className="max-w-3xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerSlow}
        >
          <motion.div variants={maskUp} className="text-center mb-14 sm:mb-20">
            <div className="inline-block mb-5">
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase bg-primary/8 text-primary px-4 py-2 rounded-md border border-white/[0.06]"
                data-testid="badge-urgency"
              >
                Now Booking for Spring 2026 &ndash; Limited Availability
              </span>
            </div>

            <motion.div
              variants={maskUp}
              className="mb-8"
              data-testid="badge-inaugural"
            >
              <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-md px-5 py-3">
                <span className="text-white/50 text-[10px] tracking-[0.25em] uppercase font-medium">
                  Inaugural Season
                </span>
                <span className="text-white/10 text-lg font-thin">|</span>
                <span className="font-mono text-primary text-lg sm:text-xl font-bold tracking-[0.1em]" data-testid="text-slots-counter">
                  04<span className="text-white/20 mx-0.5">/</span>10
                </span>
                <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-medium">
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
              className="font-serif font-bold text-white mt-4"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "-0.05em",
                lineHeight: 0.95,
              }}
            >
              Book Your Event
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mt-5 text-sm sm:text-base" style={{ lineHeight: 1.8 }}>
              Tell us about your event and we'll craft the perfect experience
            </p>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card
              className="bg-white/[0.02] border-white/[0.06] p-6 sm:p-8 lg:p-10"
              data-testid="card-booking-form"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
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

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Event Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus:border-primary/40"
                              data-testid="input-date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              <SelectItem value="corporate" data-testid="option-corporate">Corporate Event</SelectItem>
                              <SelectItem value="wedding" data-testid="option-wedding">Wedding</SelectItem>
                              <SelectItem value="private" data-testid="option-private">Private Party</SelectItem>
                              <SelectItem value="birthday" data-testid="option-birthday">Birthday Celebration</SelectItem>
                              <SelectItem value="fundraiser" data-testid="option-fundraiser">Fundraiser</SelectItem>
                              <SelectItem value="other" data-testid="option-other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                    className="w-full h-14 sm:h-auto bg-primary text-primary-foreground border border-primary-border text-base btn-glow"
                    size="lg"
                    data-testid="button-submit-booking"
                  >
                    {mutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight className="ml-2 w-4 h-4" />
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

function TrustedBySection() {
  const placeholders = [
    { name: "Your Venue", icon: Building2 },
    { name: "Partner Logo", icon: Building2 },
    { name: "Corporate Partner", icon: Building2 },
    { name: "Event Venue", icon: Building2 },
    { name: "Golf Club", icon: Building2 },
  ];

  return (
    <section className="py-16 sm:py-32 lg:py-40 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="text-center text-[10px] font-semibold text-white/25 tracking-[0.35em] uppercase mb-12"
          >
            Trusted By
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-14"
            data-testid="section-trusted-by"
          >
            {placeholders.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 opacity-15"
                data-testid={`trusted-logo-${i}`}
              >
                <item.icon className="w-8 h-8 text-white" />
                <span className="text-[9px] text-white/50 uppercase tracking-[0.15em]">{item.name}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PromiseSection() {
  return (
    <section className="py-24 sm:py-40 lg:py-56 bg-[#030303]">
      <div className="max-w-3xl mx-auto px-6 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerSlow}
        >
          <motion.div variants={maskUp} className="mb-8">
            <Award className="w-7 h-7 text-primary mx-auto" />
          </motion.div>
          <motion.h2
            variants={maskUp}
            className="font-serif font-bold text-white"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.75rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            The One More Swing Promise
          </motion.h2>
          <motion.div variants={fadeUp} className="w-10 h-px bg-primary/30 mx-auto mt-8 mb-8" />
          <motion.p
            variants={maskUp}
            className="text-white/50 text-base sm:text-lg italic"
            style={{ lineHeight: 1.8 }}
            data-testid="text-promise"
          >
            "From first contact to final teardown, we handle the details so you can enjoy the game.
            Professionalism is our baseline; excellence is our standard."
          </motion.p>
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
    <footer className="bg-[#020202] border-t border-white/[0.04] py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="space-y-5">
            <span className="font-serif text-xl font-bold text-white tracking-tight">
              One More Swing
            </span>
            <p className="text-white/30 text-[13px] max-w-xs" style={{ lineHeight: 1.8 }}>
              Premium mobile golf simulator experiences in Southern California. Concierge-level service for every event.
            </p>
          </div>

          <div className="space-y-5">
            <h4 className="text-[10px] font-semibold text-white/40 tracking-[0.25em] uppercase">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "About Us", id: "about" },
                { label: "Technology", id: "tech" },
                { label: "Packages", id: "packages" },
                { label: "Book Event", id: "booking" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-white/30 text-[13px] text-left hover-elevate px-2 py-1 rounded-md"
                  data-testid={`link-footer-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-[10px] font-semibold text-white/40 tracking-[0.25em] uppercase">
              Get In Touch
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-white/30 text-[13px]" data-testid="text-location">Southern California</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-white/30 text-[13px]" data-testid="text-email">info@onemoreswing.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] mt-12 pt-10 text-center">
          <p className="text-white/20 text-[11px] tracking-wider">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FloatingActionButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3 }}
      className="floating-fab"
    >
      <Button
        onClick={() => scrollTo("booking")}
        className="bg-primary text-primary-foreground border border-primary-border rounded-full px-6 h-12 text-sm font-semibold"
        data-testid="button-fab-inquire"
      >
        <Crosshair className="w-4 h-4 mr-2" />
        Inquire
      </Button>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden safe-area-bottom">
      <div className="film-grain" />
      <Header />
      <HeroSection />
      <AboutSection />
      <TechSection />
      <FeaturesHotspotSection />
      <PricingSection />
      <LogisticsSection />
      <BookingSection />
      <TrustedBySection />
      <PromiseSection />
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
