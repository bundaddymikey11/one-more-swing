import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/layout/MobileNav";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Target, Monitor, ShieldCheck, Trophy, Phone, Star, ArrowRight, ChevronDown, Mail, Instagram, Menu } from "lucide-react";
import logoImage from "@assets/Logo_1771044908308.png";
import simFrontImage from "@assets/Generated_Image_February_26,_2026_-_4_52PM_1772153667428.png";

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", handleScroll); return () => window.removeEventListener("scroll", handleScroll); }, []);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-500 ${scrolled ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link href="/" className="relative z-50"><img src={logoImage} alt="OMS" className={`transition-all duration-300 ${scrolled ? "h-8" : "h-12"}`} data-testid="img-header-logo" /></Link>
          <nav className="hidden md:flex items-center gap-10" data-testid="nav-desktop">
            {[{ l: "About", id: "about" }, { l: "Experience", id: "tech" }, { l: "Packages", id: "packages" }, { l: "FAQ", id: "faq" }].map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="text-xs font-bold text-white/70 tracking-[0.2em] uppercase hover:text-primary transition-colors" data-testid={`link-nav-${item.id}`}>{item.l}</button>
            ))}
            <Button onClick={() => scrollTo("booking")} className="luxury-button rounded-full px-8" data-testid="button-header-book">Inquire Now</Button>
          </nav>
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)} data-testid="button-mobile-menu"><Menu className="w-8 h-8" /></button>
        </div>
      </motion.header>
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src="/images/hero-socal.png" alt="Luxury Golf Simulator" className="w-full h-[120%] object-cover opacity-80" data-testid="img-hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
      </motion.div>
      <div className="relative z-10 container-luxury text-center pt-20">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
          <motion.div variants={fadeUp}><span className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-primary font-bold text-[10px] tracking-[0.3em] uppercase">Premium Mobile Golf Rental</span></motion.div>
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tighter text-white">One More <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-200">Swing</span></motion.h1>
          <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-lg md:text-xl text-white/70 text-balance leading-relaxed">Transform any event into an unforgettable destination. Experience hyper-realistic golf simulation delivered directly to you in Southern California.</motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button size="lg" onClick={() => scrollTo("booking")} className="luxury-button w-full sm:w-auto min-h-[56px] px-10 text-lg rounded-full" data-testid="button-hero-book">Reserve Your Date<ArrowRight className="ml-2 w-5 h-5" /></Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("packages")} className="w-full sm:w-auto min-h-[56px] px-10 text-lg rounded-full border-white/20 hover:bg-white/10 text-white" data-testid="button-hero-packages">View Packages</Button>
          </motion.div>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"><ChevronDown className="w-8 h-8 text-white/30" /></motion.div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-32 relative overflow-hidden">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
            <motion.h2 variants={fadeUp}>Where Luxury Meets <br/><span className="text-primary">Competition</span></motion.h2>
            <motion.p variants={fadeUp} className="text-lg">What started as a simple idea—bringing people together through the love of golf—has evolved into Southern California's premier mobile entertainment experience.</motion.p>
            <motion.div variants={fadeUp} className="space-y-4">{["Corporate Gatherings", "Private Estates", "Weddings", "Brand Activations"].map((item) => (<div key={item} className="flex items-center gap-4 group"><div className="w-12 h-[1px] bg-white/20 group-hover:bg-primary transition-colors" /><span className="text-lg text-white/80 font-serif tracking-wide">{item}</span></div>))}</motion.div>
          </motion.div>
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"><img src={simFrontImage} alt="Setup" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" data-testid="img-about" /></div>
            <div className="absolute -top-10 -right-10 w-full h-full border border-primary/20 rounded-2xl z-0" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-[100px] rounded-full z-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TechSection() {
  const features = [{ icon: Target, title: "Precision Tracking", desc: "Home Tee Hero software maps real-world courses with pinpoint accuracy." }, { icon: Monitor, title: "4K Resolution", desc: "Immersive visuals on our GSPro premium software library of 2,000+ courses." }, { icon: ShieldCheck, title: "Safety First", desc: "Professional 15x15x11 ft enclosure ensures safety for players and guests." }, { icon: Trophy, title: "Pro Equipment", desc: "Top-tier clubs provided for left and right-handed players of all ages." }];
  return (
    <section id="tech" className="py-32 bg-[#080808]">
      <div className="container-luxury">
        <div className="text-center max-w-3xl mx-auto mb-20"><span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Unmatched Quality</span><h2 className="mt-4">The Experience</h2></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel h-full p-8 hover:-translate-y-2 transition-transform duration-300" data-testid={`card-tech-${i}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary"><f.icon className="w-6 h-6" /></div><h3 className="text-xl font-bold mb-3">{f.title}</h3><p className="text-sm">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="packages" className="py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="container-luxury">
        <div className="text-center mb-20"><h2 className="mb-6">Curated Packages</h2><p className="max-w-xl mx-auto">Choose the perfect tier for your gathering.</p></div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="glass-panel p-10 border-primary/20 relative overflow-hidden group" data-testid="card-package-executive">
            <div className="absolute top-0 right-0 bg-primary text-black text-xs font-bold px-4 py-1">POPULAR</div>
            <h3 className="text-3xl font-bold mb-2">Executive</h3><div className="flex items-baseline gap-2 mb-8"><span className="text-5xl font-bold text-primary">$225</span><span className="text-white/50">/ hour</span></div>
            <ul className="space-y-4 mb-10">{["3-hour minimum booking", "Full simulator enclosure", "On-site technical host"].map(i => <li key={i} className="flex items-center gap-3 text-white/80"><Star className="w-4 h-4 text-primary fill-primary" />{i}</li>)}</ul>
            <Button onClick={() => scrollTo("booking")} className="luxury-button w-full h-14 text-lg" data-testid="button-book-executive">Book Executive</Button>
          </Card>
          <Card className="glass-panel p-10 flex flex-col justify-center" data-testid="card-package-allday">
            <h3 className="text-3xl font-bold mb-2">All Day</h3><div className="mb-8"><span className="text-4xl font-bold text-white">Custom</span></div><p className="mb-10 text-white/60">Perfect for weddings and tournaments. Includes branding options and extended hours.</p>
            <Button variant="outline" onClick={() => scrollTo("booking")} className="w-full h-14 text-lg border-white/20 hover:bg-white/10" data-testid="button-book-allday">Request Quote</Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

function BookingSection() {
  return (
    <section id="booking" className="py-32 relative">
      <div className="container-luxury">
        <div className="text-center mb-16"><span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Availability Limited</span><h2 className="mt-4">Secure Your Date</h2></div>
        <BookingWizard />
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="py-32 bg-[#080808]">
      <div className="container-luxury max-w-4xl">
        <h2 className="text-center mb-16">Common Questions</h2>
        <Accordion type="single" collapsible className="space-y-4">
          {[{ q: "What are the space requirements?", a: "We need a flat 18x18ft area with 12ft vertical clearance and access to a standard power outlet." }, { q: "Do you travel outside SoCal?", a: "We primarily serve Southern California but are open to travel for larger events. Contact us for a quote." }, { q: "Can we brand the simulator?", a: "Yes! The enclosure and software can be customized with your company logo or event branding." }].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 bg-white/[0.02] px-6 rounded-lg" data-testid={`faq-item-${i}`}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline hover:text-primary transition-colors py-6">{item.q}</AccordionTrigger>
              <AccordionContent className="text-white/60 pb-6 text-base">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="py-20 border-t border-white/5 bg-[#020202]">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left"><img src={logoImage} alt="OMS" className="h-8 mb-6 mx-auto md:mx-0 opacity-50 grayscale hover:grayscale-0 transition-all" /><p className="text-sm text-white/30">&copy; {new Date().getFullYear()} One More Swing. <br/>Premium Golf Entertainment.</p></div>
          <div className="flex gap-8"><a href="#" className="text-white/40 hover:text-primary transition-colors" data-testid="link-instagram"><Instagram /></a><a href="mailto:info@onemoreswing.golf" className="text-white/40 hover:text-primary transition-colors" data-testid="link-email"><Mail /></a></div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30">
      <div className="film-grain" />
      <Header />
      <HeroSection />
      <AboutSection />
      <TechSection />
      <PricingSection />
      <BookingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}