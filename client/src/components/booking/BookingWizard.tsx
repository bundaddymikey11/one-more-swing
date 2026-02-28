import { useState } from "react";
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
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle2, CreditCard, User, Sparkles, Star } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const steps = [{ id: 1, title: "Package", icon: Sparkles }, { id: 2, title: "Date", icon: CalendarIcon }, { id: 3, title: "Details", icon: User }, { id: 4, title: "Review", icon: CheckCircle2 }];
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
const eventTypes = [{ value: "corporate", label: "Corporate Event" }, { value: "birthday", label: "Birthday Party" }, { value: "wedding", label: "Wedding" }, { value: "other", label: "Other Celebration" }];

interface BookingWizardProps {
  onClose?: () => void;
}

export function BookingWizard({ onClose }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<"executive" | "allday" | null>(null);
  const form = useForm<InsertBooking>({ resolver: zodResolver(insertBookingSchema), defaultValues: { name: "", email: "", eventDate: "", eventType: "", startTime: "", location: "", message: "" } });

  const mutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      const finalData = { ...data, message: `${data.message || ''}\n[Selected Package: ${selectedPackage}]` };
      const res = await apiRequest("POST", "/api/bookings", finalData);
      return res.json();
    },
    onSuccess: () => { 
      toast({ title: "Request Received", description: "We'll be in touch shortly." }); 
      setStep(1); 
      form.reset(); 
      setSelectedPackage(null);
      if (onClose) onClose();
    },
    onError: () => { toast({ title: "Error", description: "Please try again.", variant: "destructive" }); },
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) { if (selectedPackage) isValid = true; else toast({ title: "Please select a package", variant: "destructive" }); }
    else if (step === 2) isValid = await form.trigger(["eventDate", "startTime", "eventType"]);
    else if (step === 3) isValid = await form.trigger(["name", "email", "location"]);
    if (isValid) setStep((s) => s + 1);
  };

  return (
    <div className="w-full mx-auto py-4">
      <div className="mb-12 px-2 relative flex justify-between max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${s.id <= step ? "bg-primary text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-[#1a1a1a] text-white/40 border border-white/10"}`}><s.icon className="w-5 h-5" /></div>
            <span className={`hidden sm:block text-xs uppercase tracking-widest font-semibold ${s.id <= step ? "text-white" : "text-white/30"}`}>{s.title}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="w-full">
          <Card className="glass-panel p-8 md:p-12 min-h-[500px] flex flex-col justify-center border-none shadow-none bg-transparent">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="text-center md:text-left">
                        <span className="text-primary font-semibold text-[10px] tracking-[0.35em] uppercase block mb-2">Tailored For You</span>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white" style={{ letterSpacing: "-0.04em" }}>Packages &amp; Pricing</h2>
                        <p className="text-white/50 text-sm mt-2">Choose the package that best fits your event.</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        <div
                          onClick={() => setSelectedPackage("executive")}
                          className={`relative cursor-pointer pricing-card rounded-lg p-5 sm:p-8 h-full transition-all duration-300 ring-2 ${selectedPackage === "executive" ? "ring-primary shadow-[0_0_30px_rgba(34,197,94,0.15)]" : "ring-transparent hover:ring-white/10"}`}
                          data-testid="pkg-executive"
                        >
                          <div className="space-y-4 sm:space-y-5">
                            <div className="space-y-2">
                              <span className="text-[10px] font-semibold text-primary tracking-[0.25em] uppercase">Executive</span>
                              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>Hourly Rental</h3>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-baseline gap-2 sm:gap-3">
                                <span className="text-lg sm:text-2xl font-bold text-white/20 tracking-tight line-through">$250</span>
                                <span className="text-3xl sm:text-5xl font-bold text-white tracking-tight">$225</span>
                                <span className="text-white/30 text-xs uppercase tracking-wider">/hour</span>
                              </div>
                              <span className="text-[10px] font-semibold text-primary tracking-[0.15em] uppercase block">First 5 bookings only</span>
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
                            <div className={`w-full py-2.5 rounded-md text-center text-sm font-semibold transition-all ${selectedPackage === "executive" ? "bg-primary text-black" : "bg-white/5 text-white/60 border border-white/10"}`}>
                              {selectedPackage === "executive" ? "Selected ✓" : "Select Package"}
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setSelectedPackage("allday")}
                          className={`relative cursor-pointer pricing-card rounded-lg p-5 sm:p-8 h-full flex flex-col justify-center transition-all duration-300 ring-2 ${selectedPackage === "allday" ? "ring-primary shadow-[0_0_30px_rgba(34,197,94,0.15)]" : "ring-transparent hover:ring-white/10"}`}
                          data-testid="pkg-allday"
                        >
                          <div className="space-y-4 sm:space-y-5">
                            <div className="space-y-2">
                              <span className="text-[10px] font-semibold text-primary tracking-[0.25em] uppercase">All Day</span>
                              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>Full Event Coverage</h3>
                            </div>
                            <div className="w-full h-px bg-white/[0.06]" />
                            <ul className="space-y-2.5">
                              {[
                                "Perfect for full-day events & tournaments",
                                "Custom pricing based on event duration",
                                "Includes all equipment & on-site support",
                                "Branding & customization options available",
                              ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <Star className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                  <span className="text-white/60 text-[13px] sm:text-sm" style={{ lineHeight: 1.7 }}>{item}</span>
                                </li>
                              ))}
                            </ul>
                            <div className={`w-full py-2.5 rounded-md text-center text-sm font-semibold border transition-all ${selectedPackage === "allday" ? "bg-primary text-black border-primary" : "border-primary/20 text-primary bg-primary/5 hover:bg-primary/10"}`}>
                              {selectedPackage === "allday" ? "Selected ✓" : "Get a Quote"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="text-center md:text-left"><h2 className="text-4xl font-serif mb-3">Event Logistics</h2></div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="eventDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel className="text-white/80">Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={`w-full pl-4 h-12 text-left font-normal glass-input ${!field.value && "text-muted-foreground"}`}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} disabled={(date) => date < new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel className="text-white/80">Start Time</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || undefined}><FormControl><SelectTrigger className="glass-input h-12 pl-4"><SelectValue placeholder="Select time" /></SelectTrigger></FormControl><SelectContent className="z-[3000]">{timeSlots.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="eventType" render={({ field }) => (<FormItem><FormLabel className="text-white/80">Event Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="glass-input h-12 pl-4"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent className="z-[3000]">{eventTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="text-center md:text-left"><h2 className="text-4xl font-serif mb-3">Contact Details</h2></div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel className="text-white/80">Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} className="glass-input h-12 px-4" /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel className="text-white/80">Email</FormLabel><FormControl><Input placeholder="john@example.com" {...field} className="glass-input h-12 px-4" /></FormControl><FormMessage /></FormItem>} />
                      </div>
                      <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel className="text-white/80">Location</FormLabel><FormControl><Input placeholder="City, Zip, or Venue" {...field} className="glass-input h-12 px-4" /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name="message" render={({ field }) => <FormItem><FormLabel className="text-white/80">Requests</FormLabel><FormControl><Textarea placeholder="Any specifics?" className="glass-input resize-none p-4 min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>} />
                    </motion.div>
                  )}
                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="text-center md:text-left"><h2 className="text-4xl font-serif mb-3">Review</h2><p className="text-white/50 text-lg">Verify your details.</p></div>
                      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                        <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/60">Package</span><span className="font-semibold uppercase text-primary tracking-wide">{selectedPackage}</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/60">Date</span><span className="font-semibold text-right">{form.getValues("eventDate") ? format(new Date(form.getValues("eventDate")), "MMM d") : "N/A"} @ {form.getValues("startTime")}</span></div>
                        <div className="flex justify-between"><span className="text-white/60">Location</span><span className="font-semibold text-right">{form.getValues("location")}</span></div>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4"><CreditCard className="w-6 h-6 text-primary mt-0.5" /><div className="text-base"><p className="font-semibold text-white">No payment required today</p></div></div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between pt-8 mt-8 border-t border-white/10">
                  {step > 1 ? <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} className="text-white/60 hover:text-white"><ChevronLeft className="w-5 h-5 mr-2" />Back</Button> : <div />}
                  {step < 4 ? <Button type="button" onClick={nextStep} className="luxury-button px-10 h-14 text-lg rounded-full">Next Step<ChevronRight className="w-5 h-5 ml-2" /></Button> : <Button type="submit" disabled={mutation.isPending} className="luxury-button px-10 w-full md:w-auto text-lg h-14 rounded-full">{mutation.isPending ? "Processing..." : "Submit Request"}</Button>}
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
