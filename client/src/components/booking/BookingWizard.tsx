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
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle2, CreditCard, User, Sparkles } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const steps = [{ id: 1, title: "Package", icon: Sparkles }, { id: 2, title: "Date", icon: CalendarIcon }, { id: 3, title: "Details", icon: User }, { id: 4, title: "Review", icon: CheckCircle2 }];
const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
const eventTypes = [{ value: "corporate", label: "Corporate Event" }, { value: "birthday", label: "Birthday Party" }, { value: "wedding", label: "Wedding" }, { value: "other", label: "Other Celebration" }];

export function BookingWizard() {
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
    onSuccess: () => { toast({ title: "Request Received", description: "We'll be in touch shortly." }); setStep(1); form.reset(); setSelectedPackage(null); },
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-12 px-4 relative flex justify-between">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${s.id <= step ? "bg-primary text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-[#1a1a1a] text-white/40 border border-white/10"}`}><s.icon className="w-5 h-5" /></div>
            <span className={`hidden sm:block text-xs uppercase tracking-widest font-medium ${s.id <= step ? "text-white" : "text-white/30"}`}>{s.title}</span>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glass-panel p-6 md:p-8 min-h-[500px] flex flex-col justify-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="text-center md:text-left"><h2 className="text-3xl font-serif mb-2">Select Experience</h2><p className="text-white/50">Choose the package that best fits your event.</p></div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[{ id: "executive", title: "Executive", price: "$225/hr", feats: ["3-hour minimum", "Full Setup"] }, { id: "allday", title: "All Day", price: "Custom", feats: ["Full Coverage", "Branding"] }].map((pkg) => (
                          <div key={pkg.id} onClick={() => setSelectedPackage(pkg.id as any)} className={`cursor-pointer p-6 rounded-xl border transition-all duration-300 ${selectedPackage === pkg.id ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]" : "border-white/10 hover:border-white/20 bg-white/5"}`} data-testid={`select-package-${pkg.id}`}>
                            <div className="flex justify-between items-start mb-4"><h3 className="text-xl font-bold">{pkg.title}</h3><span className="text-primary font-bold">{pkg.price}</span></div>
                            <ul className="space-y-2 text-sm text-white/60">{pkg.feats.map(f => <li key={f}>• {f}</li>)}</ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="text-center md:text-left"><h2 className="text-3xl font-serif mb-2">Event Logistics</h2></div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="eventDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={`w-full pl-3 text-left font-normal glass-input ${!field.value && "text-muted-foreground"}`}>{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date ? date.toISOString() : "")} disabled={(date) => date < new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Start Time</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || undefined}><FormControl><SelectTrigger className="glass-input"><SelectValue placeholder="Select time" /></SelectTrigger></FormControl><SelectContent>{timeSlots.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="eventType" render={({ field }) => (<FormItem><FormLabel>Event Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="glass-input"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent>{eventTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="text-center md:text-left"><h2 className="text-3xl font-serif mb-2">Contact Details</h2></div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} className="glass-input" data-testid="input-name" /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john@example.com" {...field} className="glass-input" data-testid="input-email" /></FormControl><FormMessage /></FormItem>} />
                      </div>
                      <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Zip, or Venue" {...field} className="glass-input" data-testid="input-location" /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name="message" render={({ field }) => <FormItem><FormLabel>Requests</FormLabel><FormControl><Textarea placeholder="Any specifics?" className="glass-input resize-none" {...field} data-testid="input-message" /></FormControl><FormMessage /></FormItem>} />
                    </motion.div>
                  )}
                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="text-center md:text-left"><h2 className="text-3xl font-serif mb-2">Review</h2><p className="text-white/50">Verify your details.</p></div>
                      <div className="p-6 rounded-lg bg-white/5 border border-white/10 space-y-4" data-testid="review-summary">
                        <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">Package</span><span className="font-semibold uppercase text-primary">{selectedPackage}</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">Date</span><span className="font-semibold">{form.getValues("eventDate") ? format(new Date(form.getValues("eventDate")), "MMM d") : "N/A"} @ {form.getValues("startTime")}</span></div>
                        <div className="flex justify-between"><span className="text-white/60">Location</span><span className="font-semibold">{form.getValues("location")}</span></div>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3"><CreditCard className="w-5 h-5 text-primary mt-1" /><div className="text-sm"><p className="font-semibold text-white">No payment required today</p></div></div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between pt-6 mt-6 border-t border-white/10">
                  {step > 1 ? <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} data-testid="button-back"><ChevronLeft className="w-4 h-4 mr-2" />Back</Button> : <div />}
                  {step < 4 ? <Button type="button" onClick={nextStep} className="luxury-button px-8" data-testid="button-next-step">Next Step<ChevronRight className="w-4 h-4 ml-2" /></Button> : <Button type="submit" disabled={mutation.isPending} className="luxury-button px-8 w-full md:w-auto text-lg h-12" data-testid="button-submit-booking">{mutation.isPending ? "Processing..." : "Submit Request"}</Button>}
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}