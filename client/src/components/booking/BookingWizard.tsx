import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertBookingSchema, type InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle2, User, Sparkles, Star } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MouseGlowCard, Magnetic } from "@/components/ui/PremiumInteractions";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { packages, bookingFeatures, startingAt } from "@/lib/packages";

const steps = [
  { id: 1, title: "Package", icon: Sparkles },
  { id: 2, title: "Date", icon: CalendarIcon },
  { id: 3, title: "Details", icon: User },
  { id: 4, title: "Review", icon: CheckCircle2 },
];

const TIME_SLOTS = [
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
];

const eventTypes = [
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "wedding", label: "Wedding" },
  { value: "community", label: "Community Celebration" },
  { value: "other", label: "Other" },
];

const eventLengths = [
  { value: "3_hours", label: "3 Hours (Minimum)" },
  { value: "4_hours", label: "4 Hours" },
  { value: "5_hours", label: "5 Hours" },
  { value: "6_hours", label: "6 Hours" },
  { value: "7_hours", label: "7 Hours" },
  { value: "full_day", label: "Full Day (8 Hours)" },
  { value: "call_for_quote", label: "8+ Hours — Call for Quote (Starting at $2,000)" },
];

interface BookingWizardProps {
  onClose?: () => void;
}

const errorBorder = "border-red-500/35 focus:border-primary";
const normalBorder = "";

export function BookingWizard({ onClose }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      package: "",
      eventDate: "",
      startTime: "",
      eventType: "",
      eventLength: "3_hours",
      location: "",
      message: "",
    },
    mode: "onTouched",
  });

  const selectedPackage = form.watch("package");
  const selectedEventLength = form.watch("eventLength");

  const pkg = packages.find((p) => p.id === selectedPackage) ?? packages[0];

  const lengthToHours = (v?: string) => {
    switch (v) {
      case "3_hours": return 3;
      case "4_hours": return 4;
      case "5_hours": return 5;
      case "6_hours": return 6;
      case "7_hours": return 7;
      case "full_day": return 8;
      case "call_for_quote": return null;
      default: return pkg.minimumHours;
    }
  };

  const isCallForQuote = selectedEventLength === "call_for_quote";
  const selectedHours = isCallForQuote ? pkg.minimumHours : (lengthToHours(selectedEventLength) ?? pkg.minimumHours);
  const baseHours = pkg.minimumHours;
  const baseRate = pkg.hourlyRate;
  const extraRate = 200;

  const baseCost = baseHours * baseRate;
  const extraHours = Math.max(selectedHours - baseHours, 0);
  const extraCost = extraHours * extraRate;
  const estimatedTotal = baseCost + extraCost;

  const mutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Request Received", description: "We'll be in touch shortly." });
      setStep(1);
      form.reset();
      if (onClose) onClose();
      // Alternatively, navigate to a success page or show success UI here.
      // We will leave the success toast and reset to step 1 for now, as typical for minimal forms.
    },
    onError: () => {
      // Fallback mailto: if fetch fails (meaning API no backend)
      const data = form.getValues();
      const body = `Name: ${data.firstName} ${data.lastName}%0D%0AEmail: ${data.email}%0D%0APhone: ${data.phone}%0D%0APackage: ${data.package}%0D%0ADate: ${data.eventDate} at ${data.startTime}%0D%0AEvent Type: ${data.eventType}%0D%0ALength: ${data.eventLength}%0D%0ALocation: ${data.location}%0D%0A%0D%0AMessage:%0D%0A${data.message || 'N/A'}`;
      window.location.href = `mailto:info@onemoreswing.golf?subject=New Booking Request&body=${body}`;
      toast({ title: "Redirected to email", description: "Backend not found. Opened your default email client." });
    },
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      const hasPkg = !!selectedPackage;
      const hasLen = !!form.getValues("eventLength");
      if (hasPkg && hasLen) isValid = true;
      else toast({ title: "Please select a package and event length", variant: "destructive" });
    } else if (step === 2) {
      isValid = await form.trigger(["eventDate", "startTime"]);
    } else if (step === 3) {
      isValid = await form.trigger(["firstName", "lastName", "email", "phone", "eventType", "location", "message"]);
    }
    if (isValid) setStep((s) => s + 1);
  };

  return (
    <div className="w-full mx-auto">
      <div className="mb-6 sm:mb-8 px-2 relative flex justify-between max-w-2xl mx-auto" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label={`Step ${step} of 4`}>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-700 ease-out"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${s.id <= step
                ? "bg-primary text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-4 ring-primary/10"
                : "bg-white/[0.03] text-white/40 border border-white/10"
                } ${s.id === step ? "scale-110" : "scale-100"}`}
            >
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span
              className={`hidden sm:block text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors duration-300 ${s.id <= step ? "text-white" : "text-white/30"
                }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="w-full">
          <Card className="glass-panel p-2 sm:p-4 md:p-6 flex flex-col justify-center border-none shadow-none bg-transparent">
            <Form {...form}>
              <div className="space-y-5 w-full max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6 sm:space-y-8">
                      <div className="text-center md:text-left pt-2">
                        <span className="text-primary font-semibold text-[11px] tracking-[0.45em] uppercase block mb-2">Tailored For You</span>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white" style={{ letterSpacing: "-0.04em" }}>Packages &amp; Pricing</h2>
                        <p className="text-white/60 text-sm mt-2 font-light">Select the experience that best fits your event.</p>
                      </div>
                      <div className="max-w-[400px] mx-auto">
                        <MouseGlowCard
                          className={`premium-card p-6 sm:p-8 h-full cursor-pointer flex flex-col justify-between transition-transform active:scale-[0.98] ${selectedPackage === "executive" ? "selected ring-1 ring-primary/30" : ""}`}
                        >
                          <div
                            onClick={() => { form.setValue("package", "executive", { shouldValidate: true }) }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); form.setValue("package", "executive", { shouldValidate: true }); } }}
                            tabIndex={0}
                            role="radio"
                            aria-checked={selectedPackage === "executive"}
                            className="flex flex-col h-full z-10 outline-none"
                          >
                            <div className="space-y-4">
                              <div className="space-y-1.5 text-center">
                                <span className="text-[11px] font-semibold text-primary tracking-[0.3em] uppercase">{packages[0].tag}</span>
                                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>{packages[0].title}</h3>
                              </div>

                              <div className="space-y-2 text-center">
                                <div className="flex items-baseline justify-center gap-2">
                                  <span className="text-sm font-bold text-white/15 tracking-tight line-through">${packages[0].originalHourlyRate}</span>
                                  <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">${packages[0].hourlyRate}</span>
                                  <span className="text-white/25 text-[11px] uppercase tracking-wider">{packages[0].priceUnit}</span>
                                </div>
                                <p className="text-white/40 text-[12px] sm:text-[13px] font-medium">
                                  ${pkg.hourlyRate}/hr first {pkg.minimumHours} hrs · $200/hr additional
                                </p>
                                <span className="text-[10px] font-semibold text-primary tracking-[0.15em] uppercase block">
                                  {packages[0].promo}
                                </span>
                              </div>

                              <div className="w-full h-px bg-white/[0.08]" />
                              <ul className="space-y-2.5 py-2">
                                {bookingFeatures(packages[0]).map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <Star className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                    <span className="text-white/70 text-[13px] sm:text-[14px] font-light" style={{ lineHeight: 1.5 }}>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-6 mt-auto">
                              <div className={`w-full py-3 rounded-xl text-center text-[13px] uppercase tracking-wider font-semibold transition-all duration-300 ${selectedPackage === "executive"
                                ? "bg-primary text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10"
                                }`}>
                                {selectedPackage === "executive" ? "Selected ✓" : "Select"}
                              </div>
                            </div>
                          </div>
                        </MouseGlowCard>
                      </div>

                      <FormField
                        control={form.control}
                        name="eventLength"
                        render={({ field }) => (
                          <FormItem className="max-w-[400px] mx-auto">
                            <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">
                              Event Length (3 hour minimum)
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={`glass-input h-14 pl-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.eventLength ? errorBorder : ""}`}>
                                  <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {eventLengths.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="mt-3 premium-card p-4 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="text-white/60 text-sm">
                                  {isCallForQuote ? "Price Summary" : <>Estimated total <span className="text-white/40">(based on hours)</span></>}
                                </div>
                                <div className="text-white font-semibold text-lg">
                                  {isCallForQuote ? (
                                    <span className="text-primary font-bold">Starting at $2,000</span>
                                  ) : (
                                    `$${estimatedTotal.toLocaleString()}`
                                  )}
                                </div>
                              </div>
                              {isCallForQuote && (
                                <p className="text-white/30 text-[11px] text-right">Final quote may vary based on event details.</p>
                              )}
                            </div>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4 sm:space-y-5">
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white" style={{ letterSpacing: "-0.04em" }}>Date & Time</h2>
                      </div>
                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-white/80 text-sm mb-1.5">Date</FormLabel>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-4 h-14 text-left font-normal glass-input rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all ${!field.value && "text-white/40"} ${form.formState.errors.eventDate ? errorBorder : ""}`}
                                    data-testid="input-date"
                                  >
                                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[10000] rounded-2xl border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => {
                                    field.onChange(date?.toISOString());
                                    setCalendarOpen(false);
                                  }}
                                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                  className="p-4"
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
                            <FormLabel className="text-white/80 text-sm mb-1.5">Preferred starting time</FormLabel>
                            <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 rounded-lg p-1 ${form.formState.errors.startTime ? "ring-1 ring-red-500/35" : ""}`} data-testid="time-slot-grid">
                              {TIME_SLOTS.map((slot) => {
                                const isSelected = field.value === slot.value;
                                return (
                                  <button
                                    key={slot.value}
                                    type="button"
                                    onClick={() => { field.onChange(slot.value); form.clearErrors("startTime"); }}
                                    className={`h-9 sm:h-10 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 border ${isSelected
                                      ? "border-primary bg-primary/10 text-white shadow-[0_0_12px_rgba(34,197,94,0.2)]"
                                      : "border-white/10 bg-white/[0.02] text-white/60 hover:border-primary/40 hover:bg-white/[0.04] hover:text-white/80"
                                      }`}
                                    data-testid={`time-slot-${slot.value}`}
                                  >
                                    {slot.label}
                                  </button>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4 sm:space-y-5">
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white" style={{ letterSpacing: "-0.04em" }}>Event Details</h2>
                      </div>

                      <div className="premium-card p-4 sm:p-5 space-y-2 border border-white/10">
                        {isCallForQuote ? (
                          <>
                            <div className="flex justify-between text-white/70 text-sm">
                              <span>Extended Event (8+ Hours)</span>
                              <span className="text-primary font-semibold">Starting at $2,000+</span>
                            </div>
                            <div className="flex justify-between text-white font-semibold text-lg border-t border-white/10 pt-2">
                              <span>Total</span>
                              <span className="text-primary">Custom Quote Required</span>
                            </div>
                            <p className="text-white/30 text-[11px] text-right pt-1">Final quote may vary based on event details.</p>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-white/70 text-sm">
                              <span>{baseHours} hrs × ${baseRate}</span>
                              <span>${baseCost.toLocaleString()}</span>
                            </div>
                            {extraHours > 0 && (
                              <div className="flex justify-between text-white/70 text-sm">
                                <span>{extraHours} hrs × ${extraRate}</span>
                                <span>${extraCost.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-white font-semibold text-lg border-t border-white/10 pt-2">
                              <span>Total</span>
                              <span>${estimatedTotal.toLocaleString()}</span>
                            </div>
                          </>
                        )}

                      </div>
                      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="First Name" {...field} className={`glass-input h-14 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.firstName ? errorBorder : ""}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Last Name" {...field} className={`glass-input h-14 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.lastName ? errorBorder : ""}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} className={`glass-input h-14 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.email ? errorBorder : ""}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" type="tel" {...field} className={`glass-input h-14 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.phone ? errorBorder : ""}`} />
                              </FormControl>
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
                            <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">Type of Event</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={`glass-input h-14 pl-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.eventType ? errorBorder : ""}`}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10000]">
                                {eventTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">Desired Location for Enclosure</FormLabel>
                            <FormControl>
                              <Input placeholder="City, Zip, or Venue Name" {...field} className={`glass-input h-14 px-4 rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 ${form.formState.errors.location ? errorBorder : ""}`} />
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
                            <FormLabel className="text-white/80 text-sm mb-1.5 font-medium">Description of Event (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any specifics about your event?" className={`glass-input rounded-xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all focus:border-primary/50 resize-none p-4 min-h-[100px] ${form.formState.errors.message ? errorBorder : ""}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4 sm:space-y-5">
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white" style={{ letterSpacing: "-0.04em" }}>Review Details</h2>
                        <p className="text-white/50 text-sm mt-1">Verify your selections.</p>
                      </div>
                      <div className="premium-card p-6 sm:p-8 space-y-0">
                        <div className="flex justify-between items-center border-b border-white/10 py-4">
                          <span className="text-white/60 text-sm">Package</span>
                          <span className="font-semibold uppercase text-primary tracking-wide text-sm">{pkg.tag} · {pkg.title}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 py-4">
                          <span className="text-white/60 text-sm">Event Length</span>
                          <span className="font-semibold text-right text-sm">
                            {isCallForQuote ? <span className="text-primary">8+ Hours — Call for Quote</span> : `${selectedHours} hours`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 py-4">
                          <span className="text-white/60 text-sm">Date &amp; Time</span>
                          <span className="font-semibold text-right text-sm">
                            {form.getValues("eventDate") ? format(new Date(form.getValues("eventDate")), "MMM d, yyyy") : "N/A"} @ {TIME_SLOTS.find(s => s.value === form.getValues("startTime"))?.label || form.getValues("startTime")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 py-4">
                          <span className="text-white/60 text-sm">Name</span>
                          <span className="font-semibold text-right text-sm">{form.getValues("firstName")} {form.getValues("lastName")}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 py-4">
                          <span className="text-white/60 text-sm">Location</span>
                          <span className="font-semibold text-right text-sm">{form.getValues("location")}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 py-4">
                          <span className="text-white/60 text-sm">{baseHours} hrs × ${baseRate}</span>
                          <span className="font-semibold text-right text-sm">${baseCost.toLocaleString()}</span>
                        </div>
                        {extraHours > 0 && (
                          <div className="flex justify-between items-center border-b border-white/10 py-4">
                            <span className="text-white/60 text-sm">{extraHours} hrs × ${extraRate} (additional)</span>
                            <span className="font-semibold text-right text-sm">${extraCost.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex flex-col border-b border-white/10 py-4 gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Price Summary</span>
                            <span className="font-bold text-right text-lg text-primary">
                              {isCallForQuote ? "Starting at $2,000" : `$${estimatedTotal.toLocaleString()}`}
                            </span>
                          </div>
                          {isCallForQuote && (
                            <p className="text-white/30 text-[11px] text-right">Final quote may vary based on event details.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between pt-6 mt-4 border-t border-white/10">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep((s) => s - 1)}
                      className="text-white/60 hover:text-white min-h-[48px] px-5"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  {step < 4 ? (
                    <Magnetic>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="luxury-button px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg rounded-full"
                      >
                        Continue Booking<ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Magnetic>
                  ) : (
                    <Magnetic>
                      <Button
                        type="button"
                        disabled={mutation.isPending}
                        onClick={form.handleSubmit((d) => mutation.mutate(d))}
                        className="luxury-button px-8 sm:px-10 w-full md:w-auto text-base sm:text-lg h-12 sm:h-14 rounded-full"
                      >
                        {mutation.isPending ? "Processing..." : "Submit Request"}
                      </Button>
                    </Magnetic>
                  )}
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
