import { useState, useEffect } from "react";
import { adminApiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
    Settings, User, Lock, Bell, Database, DollarSign,
    Save, Eye, EyeOff, ChevronRight, Check, AlertTriangle,
    Download, Zap, Shield, Mail, Phone, Building, Target,
    ExternalLink, RefreshCw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── localStorage helpers ──
const LS = {
    get: (key: string, fallback: string = "") => {
        try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
    },
    set: (key: string, val: string) => {
        try { localStorage.setItem(key, val); } catch { }
    },
};

// ── Toggle switch ──
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${checked ? "bg-[#552583]" : "bg-zinc-700"}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </button>
    );
}

// ── Section card wrapper ──
function Section({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) {
    return (
        <Card className="bg-zinc-900/60 border-[#552583]/20 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-zinc-800/60 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center shadow-md shadow-[#552583]/20 flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-white text-base">{title}</CardTitle>
                        <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">{children}</CardContent>
        </Card>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 items-start">
            <div className="col-span-1 pt-2">
                <p className="text-zinc-300 text-sm font-medium">{label}</p>
                {hint && <p className="text-zinc-600 text-xs mt-0.5">{hint}</p>}
            </div>
            <div className="col-span-2">{children}</div>
        </div>
    );
}

export default function SettingsPage() {
    const { toast } = useToast();
    const [, navigate] = useLocation();

    // Business profile
    const [businessName, setBusinessName] = useState(LS.get("oms_biz_name", "One More Swing"));
    const [bizEmail, setBizEmail] = useState(LS.get("oms_biz_email", "info@onemoreswing.golf"));
    const [bizPhone, setBizPhone] = useState(LS.get("oms_biz_phone", ""));
    const [bizCity, setBizCity] = useState(LS.get("oms_biz_city", "Scottsdale, AZ"));

    // Revenue goal
    const [revenueGoal, setRevenueGoal] = useState(LS.get("oms_revenue_goal", "50000"));

    // Notifications
    const [notifyNewLead, setNotifyNewLead] = useState(LS.get("oms_notify_new_lead", "true") === "true");
    const [notifyConfirmed, setNotifyConfirmed] = useState(LS.get("oms_notify_confirmed", "true") === "true");
    const [notifyWeekly, setNotifyWeekly] = useState(LS.get("oms_notify_weekly", "false") === "true");

    // Password change
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [passLoading, setPassLoading] = useState(false);

    // Data ops
    const [seeding, setSeeding] = useState(false);

    // Save profile to localStorage
    const saveProfile = () => {
        LS.set("oms_biz_name", businessName);
        LS.set("oms_biz_email", bizEmail);
        LS.set("oms_biz_phone", bizPhone);
        LS.set("oms_biz_city", bizCity);
        toast({ title: "Business profile saved ✓" });
    };

    const saveGoal = () => {
        const num = parseInt(revenueGoal.replace(/\D/g, ""), 10);
        if (isNaN(num) || num < 1000) {
            toast({ variant: "destructive", title: "Enter a valid goal (min $1,000)" }); return;
        }
        LS.set("oms_revenue_goal", String(num));
        toast({ title: `Revenue goal set to $${num.toLocaleString()} ✓` });
    };

    const saveNotifications = () => {
        LS.set("oms_notify_new_lead", String(notifyNewLead));
        LS.set("oms_notify_confirmed", String(notifyConfirmed));
        LS.set("oms_notify_weekly", String(notifyWeekly));
        toast({ title: "Notification preferences saved ✓" });
    };

    const changePassword = async () => {
        if (!currentPass || !newPass || !confirmPass) {
            toast({ variant: "destructive", title: "All password fields are required" }); return;
        }
        if (newPass !== confirmPass) {
            toast({ variant: "destructive", title: "New passwords don't match" }); return;
        }
        if (newPass.length < 8) {
            toast({ variant: "destructive", title: "Password must be at least 8 characters" }); return;
        }
        setPassLoading(true);
        try {
            // Verify current password via login endpoint
            const verifyRes = await fetch("/api/auth/login", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: currentPass }),
            });
            if (!verifyRes.ok) {
                toast({ variant: "destructive", title: "Current password is incorrect" });
                return;
            }
            // The actual password is stored in ADMIN_PASSWORD env var on server.
            // Show instructions since env var change requires Render update.
            toast({
                title: "Password verified ✓",
                description: "Update ADMIN_PASSWORD in your Render environment variables to apply the new password.",
            });
            // Update localStorage with new password for this session
            localStorage.setItem("admin_pass", newPass);
            setCurrentPass(""); setNewPass(""); setConfirmPass("");
        } catch {
            toast({ variant: "destructive", title: "Something went wrong. Please try again." });
        } finally {
            setPassLoading(false);
        }
    };

    const exportData = async () => {
        try {
            const res = await adminApiRequest("GET", "/api/bookings");
            const data = await res.json();
            const headers = ["Name", "Email", "Phone", "Package", "Event Date", "Status", "Created"];
            const rows = data.map((l: any) => [
                `${l.firstName} ${l.lastName}`, l.email, l.phone, l.package,
                l.eventDate, l.status, new Date(l.createdAt).toLocaleDateString(),
            ]);
            const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url;
            a.download = `oms-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
            toast({ title: "Data exported ✓" });
        } catch {
            toast({ variant: "destructive", title: "Export failed" });
        }
    };

    const seedData = async () => {
        setSeeding(true);
        try {
            await adminApiRequest("POST", "/api/admin/seed");
            toast({ title: "Demo data seeded ✓", description: "Refresh to see sample leads." });
        } catch {
            toast({ variant: "destructive", title: "Seeding failed" });
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center shadow-md">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    Settings
                </h1>
                <p className="text-zinc-500 text-sm mt-1 ml-12">Manage your Command Center preferences</p>
            </div>

            {/* ── Business Profile ── */}
            <Section icon={Building} title="Business Profile" desc="Your public-facing business information">
                <Field label="Business Name">
                    <Input value={businessName} onChange={e => setBusinessName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white" />
                </Field>
                <Field label="Email Address" hint="Used in email templates">
                    <Input value={bizEmail} onChange={e => setBizEmail(e.target.value)} type="email"
                        className="bg-zinc-800 border-zinc-700 text-white" />
                </Field>
                <Field label="Phone Number">
                    <Input value={bizPhone} onChange={e => setBizPhone(e.target.value)} type="tel"
                        placeholder="(602) 555-0000"
                        className="bg-zinc-800 border-zinc-700 text-white" />
                </Field>
                <Field label="City / Market">
                    <Input value={bizCity} onChange={e => setBizCity(e.target.value)}
                        placeholder="Scottsdale, AZ"
                        className="bg-zinc-800 border-zinc-700 text-white" />
                </Field>
                <div className="flex justify-end pt-2">
                    <Button onClick={saveProfile}
                        className="bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20 gap-2">
                        <Save className="w-4 h-4" /> Save Profile
                    </Button>
                </div>
            </Section>

            {/* ── Revenue Goal ── */}
            <Section icon={Target} title="Revenue Goal" desc="Sets the progress bar target on your Executive Dashboard">
                <Field label="Annual Target ($)" hint="Displayed as a progress bar on Overview">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                        <Input
                            value={revenueGoal}
                            onChange={e => setRevenueGoal(e.target.value.replace(/\D/g, ""))}
                            className="bg-zinc-800 border-zinc-700 text-white pl-7"
                            placeholder="50000"
                        />
                    </div>
                </Field>
                <div className="flex justify-end pt-2">
                    <Button onClick={saveGoal}
                        className="bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20 gap-2">
                        <Save className="w-4 h-4" /> Save Goal
                    </Button>
                </div>
            </Section>

            {/* ── Notifications ── */}
            <Section icon={Bell} title="Notifications" desc="Control which email alerts you receive">
                {[
                    { label: "New Booking Lead", hint: "Email when someone submits the booking form", val: notifyNewLead, set: setNotifyNewLead },
                    { label: "Booking Confirmed", hint: "Email when a lead status changes to Confirmed", val: notifyConfirmed, set: setNotifyConfirmed },
                    { label: "Weekly Summary", hint: "Sunday morning recap of leads and revenue", val: notifyWeekly, set: setNotifyWeekly },
                ].map(({ label, hint, val, set }) => (
                    <div key={label} className="flex items-center justify-between py-1">
                        <div>
                            <p className="text-zinc-300 text-sm font-medium">{label}</p>
                            <p className="text-zinc-600 text-xs">{hint}</p>
                        </div>
                        <Toggle checked={val} onChange={set} />
                    </div>
                ))}
                <div className="flex justify-end pt-2">
                    <Button onClick={saveNotifications}
                        className="bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20 gap-2">
                        <Save className="w-4 h-4" /> Save Preferences
                    </Button>
                </div>
            </Section>

            {/* ── Security ── */}
            <Section icon={Lock} title="Security" desc="Change your admin access password">
                <Field label="Current Password">
                    <div className="relative">
                        <Input type={showPass ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white pr-10" placeholder="Your current password" />
                        <button type="button" onClick={() => setShowPass(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </Field>
                <Field label="New Password" hint="Min 8 characters">
                    <Input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white" placeholder="New password" />
                </Field>
                <Field label="Confirm Password">
                    <Input type={showPass ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white" placeholder="Repeat new password" />
                </Field>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FDB927]/5 border border-[#FDB927]/20">
                    <AlertTriangle className="w-4 h-4 text-[#FDB927] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400">Password changes apply to your Render environment. After saving here, update <code className="text-[#FDB927]">ADMIN_PASSWORD</code> in Render → Environment to take effect on the live site.</p>
                </div>
                <div className="flex justify-end">
                    <Button onClick={changePassword} disabled={passLoading}
                        className="bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20 gap-2">
                        {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Change Password
                    </Button>
                </div>
            </Section>

            {/* ── Team / Access ── */}
            <Section icon={Shield} title="Team & Access" desc="Manage user accounts and role-based permissions">
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-[#552583]/30 transition-colors cursor-pointer group"
                    onClick={() => navigate("/admin/users")}>
                    <div>
                        <p className="text-white text-sm font-semibold group-hover:text-[#FDB927] transition-colors">Manage Team Members</p>
                        <p className="text-zinc-500 text-xs">Add Admin or Viewer accounts for your team</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#FDB927] transition-colors" />
                </div>
            </Section>

            {/* ── Data Management ── */}
            <Section icon={Database} title="Data Management" desc="Export your data or seed demo records">
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
                        <div>
                            <p className="text-white text-sm font-semibold">Export All Leads</p>
                            <p className="text-zinc-500 text-xs">Download your full lead database as a CSV file</p>
                        </div>
                        <Button onClick={exportData} variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 text-xs">
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
                        <div>
                            <p className="text-white text-sm font-semibold">Load Demo Data</p>
                            <p className="text-zinc-500 text-xs">Populate the dashboard with sample leads for demos</p>
                        </div>
                        <Button onClick={seedData} disabled={seeding} variant="outline"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 text-xs">
                            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            Seed Data
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-800">
                        <div>
                            <p className="text-white text-sm font-semibold">Render Dashboard</p>
                            <p className="text-zinc-500 text-xs">Update environment variables and redeploy</p>
                        </div>
                        <a href="https://render.com" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2 text-xs">
                                <ExternalLink className="w-3.5 h-3.5" /> Open Render
                            </Button>
                        </a>
                    </div>
                </div>
            </Section>

            {/* ── App info ── */}
            <div className="flex items-center justify-between text-xs text-zinc-700 py-4 border-t border-zinc-900">
                <span>One More Swing · Command Center v2.0</span>
                <span>Built with ♥ for the Laker in you 🏀</span>
            </div>
        </div>
    );
}
