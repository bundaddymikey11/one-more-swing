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
} from "lucide-react";
import logoImage from "@assets/4FE308C0-2329-4286-AFB7-55F3EA548A7F_1770779225660.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};

function Header() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-[999] bg-[#000000] border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-14 sm:h-20">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center shrink-0"
            data-testid="link-logo"
          >
            <img src={logoImage} alt="One More Swing" className="h-9 sm:h-14 w-auto" data-testid="img-logo-header" />
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
                className="text-sm font-medium text-white/60 tracking-wider uppercase hover-elevate px-2 py-1 rounded-md"
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
            <span className="hidden sm:inline">Book Your Event</span>
            <span className="sm:hidden text-sm">Book</span>
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

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <img
          src="/images/hero-socal.png"
          alt="Southern California luxury golf lifestyle"
          className="w-full h-full object-cover"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/50 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-6 sm:space-y-8"
        >
          <motion.div variants={fadeUp} className="space-y-2">
            <span className="inline-block text-primary font-semibold text-xs sm:text-sm tracking-[0.3em] uppercase">
              Premium Mobile Golf Simulator
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tighter"
          >
            The New Standard of
            <br />
            Event <span className="text-primary">Entertainment</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto"
            style={{ lineHeight: 1.7 }}
          >
            Most event entertainment is a distraction. One More Swing is a destination.
            A premium mobile golf simulator delivered with concierge-level service
            and professional-grade technology.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => scrollTo("booking")}
              className="w-full sm:w-auto h-14 sm:h-auto bg-primary text-primary-foreground border border-primary-border text-base px-8 btn-glow"
              data-testid="button-hero-book"
            >
              Book Your Event
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("packages")}
              className="w-full sm:w-auto h-14 sm:h-auto text-base px-8 bg-white/5 backdrop-blur-sm border-white/20 text-white"
              data-testid="button-hero-packages"
            >
              View Packages
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={() => scrollTo("about")}
            className="text-white/40 animate-bounce"
            data-testid="button-scroll-down"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          <motion.div variants={fadeUp} className="space-y-6">
            <div className="space-y-3">
              <span className="text-primary font-semibold text-xs tracking-[0.3em] uppercase">
                The Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tighter">
                About One More Swing
              </h2>
            </div>
            <p className="text-white/60 text-base sm:text-lg" style={{ lineHeight: 1.7 }}>
              Arriving in Southern California, One More Swing brings the excitement of
              the course directly to you. We specialize in fully immersive simulator
              experiences designed for corporate gatherings, private events, and special
              occasions.
            </p>
            <p className="text-white/60 text-base sm:text-lg" style={{ lineHeight: 1.7 }}>
              Whether your guests are scratch golfers or picking up a club for the first
              time, we provide a professional and unforgettable atmosphere anywhere you
              host.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-courses">200+</div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Courses</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-4k">4K</div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Resolution</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-service">5-Star</div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Service</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={scaleIn} className="relative">
            <div className="relative rounded-md overflow-hidden border border-white/[0.10]">
              <img
                src="/images/hero-golf.png"
                alt="Golf simulator experience"
                className="w-full aspect-[4/3] object-cover"
                data-testid="img-about"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 border border-primary/10 rounded-md" />
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
    <section id="tech" className="py-16 sm:py-24 lg:py-32 bg-[#030303]">
      <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="text-center mb-14 sm:mb-20"
        >
          <motion.span variants={fadeUp} className="text-primary font-semibold text-xs tracking-[0.3em] uppercase">
            World-Class Technology
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 tracking-tighter"
          >
            The Tech & Experience
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 max-w-2xl mx-auto mt-4 text-base sm:text-lg" style={{ lineHeight: 1.7 }}>
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
            <motion.div key={index} variants={fadeUp}>
              <Card
                className="group relative bg-white/[0.03] border-white/10 p-6 sm:p-8 h-full hover-elevate"
                data-testid={`card-tech-${index}`}
              >
                <div className="w-12 h-12 rounded-md bg-primary/10 border border-white/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-white text-base mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm" style={{ lineHeight: 1.7 }}>
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
    <section id="packages" className="py-16 sm:py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="text-center mb-14 sm:mb-20"
        >
          <motion.span variants={fadeUp} className="text-primary font-semibold text-xs tracking-[0.3em] uppercase">
            Tailored For You
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 tracking-tighter"
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
          <motion.div variants={scaleIn}>
            <div
              className="relative pricing-card rounded-md p-8 sm:p-10 h-full"
              data-testid="card-package-standard"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">
                    Standard
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    Hourly Rental
                  </h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white">$175</span>
                  <span className="text-white/40 text-sm">/hour</span>
                </div>

                <div className="w-full h-px bg-white/10" />

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
                      <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-white/70 text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
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

          <motion.div variants={scaleIn}>
            <div
              className="relative pricing-card rounded-md p-8 sm:p-10 h-full"
              data-testid="card-package-luxury"
            >
              <div className="absolute top-0 right-0 m-4">
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase bg-primary/10 px-3 py-1.5 rounded-md border border-white/10">
                  Premium
                </span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase">
                    Full-Day
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    Luxury Experience
                  </h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white">Custom</span>
                  <span className="text-white/40 text-sm">pricing</span>
                </div>

                <div className="w-full h-px bg-white/10" />

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
                      <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-white/70 text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => scrollTo("booking")}
                  variant="outline"
                  className="w-full h-14 sm:h-auto border-primary/30 text-primary bg-primary/5"
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
    <section className="py-12 sm:py-24 lg:py-32 bg-[#030303]">
      <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 gap-6"
        >
          <motion.div variants={fadeUp}>
            <Card
              className="bg-white/[0.03] border-white/10 p-6 sm:p-8 h-full"
              data-testid="card-logistics-space"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base mb-1">Space Needed</h3>
                  <p className="text-2xl font-bold text-white mb-2">16 x 16 x 12 ft</p>
                  <p className="text-white/50 text-sm" style={{ lineHeight: 1.7 }}>
                    Minimum clearance for our premium enclosure. We handle all setup and teardown.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card
              className="bg-white/[0.03] border-white/10 p-6 sm:p-8 h-full"
              data-testid="card-logistics-power"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base mb-1">Power Required</h3>
                  <p className="text-2xl font-bold text-white mb-2">Standard Outlet</p>
                  <p className="text-white/50 text-sm" style={{ lineHeight: 1.7 }}>
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
    <section id="booking" className="py-16 sm:py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-3xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4">
              <span
                className="text-[11px] font-bold tracking-[0.15em] uppercase bg-primary/10 text-primary px-4 py-2 rounded-md border border-white/10"
                data-testid="badge-urgency"
              >
                Now Booking for Spring 2026 &ndash; Limited Availability
              </span>
            </div>
            <div>
              <span className="text-primary font-semibold text-xs tracking-[0.3em] uppercase">
                Reserve Your Date
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 tracking-tighter">
              Book Your Event
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mt-4 text-base sm:text-lg" style={{ lineHeight: 1.7 }}>
              Tell us about your event and we'll craft the perfect experience
            </p>
          </motion.div>

          <motion.div variants={scaleIn}>
            <Card
              className="bg-white/[0.03] border-white/10 p-6 sm:p-8 lg:p-10"
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
                          <FormLabel className="text-white/70 text-sm">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Smith"
                              className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-primary/50"
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
                          <FormLabel className="text-white/70 text-sm">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-primary/50"
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
                          <FormLabel className="text-white/70 text-sm">Event Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-primary/50"
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
                          <FormLabel className="text-white/70 text-sm">Event Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger
                                className="bg-white/[0.04] border-white/10 text-white"
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
                        <FormLabel className="text-white/70 text-sm">
                          Location <span className="text-white/30">(City or Zip Code)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Los Angeles, CA or 90210"
                            className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-primary/50"
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
                        <FormLabel className="text-white/70 text-sm">
                          Additional Details <span className="text-white/30">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your event, expected number of guests, location, etc."
                            rows={4}
                            className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/25 focus:border-primary/50 resize-none"
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
                        Send Booking Request
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
    <section className="py-12 sm:py-24 lg:py-32 bg-[#030303]">
      <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="text-center text-xs font-semibold text-white/30 tracking-[0.3em] uppercase mb-10"
          >
            Trusted By
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            data-testid="section-trusted-by"
          >
            {placeholders.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 opacity-20"
                data-testid={`trusted-logo-${i}`}
              >
                <item.icon className="w-8 h-8 text-white" />
                <span className="text-[10px] text-white/60 uppercase tracking-wider">{item.name}</span>
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
    <section className="py-16 sm:py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-3xl mx-auto px-6 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-6">
            <Award className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tighter"
          >
            The One More Swing Promise
          </motion.h2>
          <motion.div variants={fadeUp} className="w-12 h-px bg-primary/40 mx-auto mt-6 mb-6" />
          <motion.p
            variants={fadeUp}
            className="text-white/60 text-base sm:text-lg italic"
            style={{ lineHeight: 1.7 }}
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
    <footer className="bg-[#020202] border-t border-white/5 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="space-y-4">
            <span className="font-serif text-xl font-bold text-white">
              One More Swing
            </span>
            <p className="text-white/40 text-sm max-w-xs" style={{ lineHeight: 1.7 }}>
              Premium mobile golf simulator experiences in Southern California. Concierge-level service for every event.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white/60 tracking-[0.2em] uppercase">
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
                  className="text-white/40 text-sm text-left hover-elevate px-2 py-1 rounded-md"
                  data-testid={`link-footer-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-white/60 tracking-[0.2em] uppercase">
              Get In Touch
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-white/40 text-sm" data-testid="text-location">Southern California</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-white/40 text-sm" data-testid="text-email">info@onemoreswing.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-8 text-center">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden safe-area-bottom">
      <Header />
      <HeroSection />
      <AboutSection />
      <TechSection />
      <PricingSection />
      <LogisticsSection />
      <BookingSection />
      <TrustedBySection />
      <PromiseSection />
      <Footer />
    </div>
  );
}
