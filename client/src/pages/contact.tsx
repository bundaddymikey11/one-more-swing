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
  Phone,
  Mail,
  Send,
  CalendarIcon,
  Clock,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { format } from "date-fns";

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

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
  "8:00 PM",
];

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
              className="bg-primary text-primary-foreground border border-primary-border shrink-0 btn-glow min-h-[44px] sm:h-auto"
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      name: "",
      email: "",
      eventDate: "",
      eventType: "other",
      startTime: "",
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
    <div className="min-h-dvh bg-[#050505] overflow-x-hidden safe-area-bottom">
      <div className="film-grain" />
      <ContactHeader />

      <section className="pt-24 sm:pt-36 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerSlow}
          >
            <motion.div variants={maskUp} className="text-center mb-8 sm:mb-14">
              <span className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block mb-3">
                Reach Out
              </span>
              <h1
                className="font-serif font-bold text-white"
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  letterSpacing: "-0.05em",
                  lineHeight: 0.9,
                }}
              >
                Get in Touch
              </h1>
              <p className="text-white/40 max-w-xl mx-auto mt-4 text-sm sm:text-base" style={{ lineHeight: 1.8 }}>
                Have a question about our services? Ready to book your event?
                Fill out the form below or give us a call.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8">
              <motion.div variants={maskUp} className="lg:col-span-2 space-y-4">
                <Card className="bg-white/[0.02] border-white/[0.06] p-5 sm:p-7 rounded-lg" data-testid="card-contact-info">
                  <h2 className="font-serif text-xl font-bold text-white mb-6" style={{ letterSpacing: "-0.03em" }}>
                    Contact Information
                  </h2>

                  <div className="space-y-5">
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
                          className="text-white font-semibold text-[15px] sm:text-base hover-elevate px-1 py-1 rounded-md -ml-1 inline-flex items-center min-h-[44px]"
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
                          className="text-white font-semibold text-[15px] sm:text-base hover-elevate px-1 py-1 rounded-md -ml-1 inline-flex items-center min-h-[44px]"
                          data-testid="link-email"
                        >
                          info@onemoreswing.golf
                        </a>
                      </div>
                    </div>

                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} className="lg:col-span-3">
                <Card className="bg-white/[0.02] border-white/[0.06] p-5 sm:p-8 rounded-lg" data-testid="card-contact-form">
                  <h2 className="font-serif text-xl font-bold text-white mb-6" style={{ letterSpacing: "-0.03em" }}>
                    Send a Message
                  </h2>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
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
                      </div>

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

                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="eventDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Preferred Date</FormLabel>
                              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={`w-full justify-start text-left font-normal bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05] h-9 ${
                                        !field.value ? "text-white/20" : "text-white"
                                      }`}
                                      data-testid="input-contact-date"
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
                                    data-testid="select-contact-start-time"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-white/40" />
                                      <SelectValue placeholder="Select time" />
                                    </div>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
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
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/60 text-xs uppercase tracking-[0.1em]">Message or Question</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="How can we help you?"
                                rows={4}
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
                        className="w-full bg-primary text-primary-foreground border border-primary-border min-h-[48px] text-base btn-glow"
                        disabled={mutation.isPending}
                        data-testid="button-contact-submit"
                      >
                        {mutation.isPending ? (
                          <span className="flex items-center gap-2" role="status" aria-live="polite">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                            Sending...
                          </span>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 w-4 h-4" aria-hidden="true" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#020202] border-t border-white/[0.04] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 text-center">
          <p className="text-white/20 text-[11px] tracking-wider">
            &copy; {new Date().getFullYear()} One More Swing. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
