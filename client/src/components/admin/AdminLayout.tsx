import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
    LayoutDashboard, Users, Settings, LogOut, Lock, DollarSign,
    Megaphone, Shield, Eye, ChevronRight, Receipt, Scale, Menu, X, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminUser {
    name: string;
    email: string;
    role: "admin" | "viewer";
}

const ALL_NAV_ITEMS = [
    { href: "/admin",           label: "Overview",  icon: LayoutDashboard, roles: ["admin", "viewer"] },
    { href: "/admin/leads",     label: "Leads",     icon: Users,           roles: ["admin", "viewer"] },
    { href: "/admin/sales",     label: "Sales",     icon: DollarSign,      roles: ["admin"] },
    { href: "/admin/marketing", label: "Marketing", icon: Megaphone,       roles: ["admin"] },
    { href: "/admin/expenses",  label: "Expenses",  icon: Receipt,         roles: ["admin"] },
    { href: "/admin/legal",     label: "Legal",     icon: Scale,           roles: ["admin"] },
    { href: "/admin/users",     label: "Team",      icon: Shield,          roles: ["admin"] },
    { href: "/admin/settings",  label: "Settings",  icon: Settings,        roles: ["admin", "viewer"] },
];

// Bottom tab bar shows these 5 on mobile (priority items)
const MOBILE_TABS = ["/admin", "/admin/leads", "/admin/sales", "/admin/expenses", "/admin/settings"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authed, setAuthed] = useState(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [location] = useLocation();

    useEffect(() => {
        const pass = localStorage.getItem("admin_pass");
        const storedUser = localStorage.getItem("admin_user");
        if (pass && storedUser) {
            try { setAdminUser(JSON.parse(storedUser)); setAuthed(true); }
            catch { logout(); }
        }
    }, []);

    // Close drawer on route change
    useEffect(() => { setDrawerOpen(false); }, [location]);

    const handleLogin = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) { setError("Invalid password. Please try again."); return; }
            const user: AdminUser = await res.json();
            localStorage.setItem("admin_pass", password);
            localStorage.setItem("admin_role", user.role);
            localStorage.setItem("admin_user", JSON.stringify(user));
            setAdminUser(user); setAuthed(true);
        } catch {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [password]);

    const logout = () => {
        localStorage.removeItem("admin_pass");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_user");
        setAuthed(false); setAdminUser(null); setPassword("");
    };

    // ── Login screen ──────────────────────────────────────────
    if (!authed) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#552583]/20 via-black to-black" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#FDB927]/10 animate-pulse" />
                <Card className="relative w-full max-w-md bg-zinc-900/90 border-[#552583]/30 shadow-2xl shadow-black/50 backdrop-blur">
                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#552583] to-[#FDB927] mx-auto mb-4 shadow-lg shadow-[#552583]/30">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#FDB927] to-[#552583] bg-clip-text text-transparent">Command Center</CardTitle>
                        <p className="text-sm text-zinc-500 mt-1">One More Swing — Internal Admin</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter your access password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(""); }}
                                onKeyDown={e => e.key === "Enter" && handleLogin()}
                                className="bg-zinc-800 border-[#552583]/30 text-white placeholder:text-zinc-600 h-11 focus:border-[#FDB927]/50"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                        <Button
                            onClick={handleLogin}
                            disabled={!password || loading}
                            className="w-full h-11 bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20"
                        >
                            {loading
                                ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-[#FDB927] rounded-full animate-spin" /> Signing in...</div>
                                : <div className="flex items-center gap-2">Sign In <ChevronRight className="w-4 h-4" /></div>}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const role = adminUser?.role || "viewer";
    const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));
    const mobileTabItems = navItems.filter(item => MOBILE_TABS.includes(item.href));

    const isActive = (href: string) => {
        if (href === "/admin") return location === "/admin";
        return location.startsWith(href);
    };

    const pageLabel = location.replace("/admin/", "").replace("/admin", "Overview");
    const capitalizedLabel = pageLabel.charAt(0).toUpperCase() + pageLabel.slice(1);

    return (
        <div className="min-h-screen bg-zinc-950 flex">

            {/* ── DESKTOP Sidebar (hidden on mobile) ────────────── */}
            <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#1a0a2e] via-[#2a1052]/40 to-zinc-950 border-r border-[#552583]/20 flex-col flex-shrink-0 sticky top-0 h-screen">
                {/* Logo */}
                <div className="p-6 border-b border-[#552583]/20">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center shadow-lg shadow-[#552583]/30">
                            <span className="text-white font-black text-sm">OMS</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-tight">One More Swing</p>
                            <p className="text-[#FDB927]/60 text-xs">Command Center</p>
                        </div>
                    </div>
                </div>
                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(item => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <a className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    active
                                        ? "bg-gradient-to-r from-[#552583]/20 to-[#FDB927]/10 text-[#FDB927] border border-[#552583]/30 shadow-inner"
                                        : "text-zinc-400 hover:text-white hover:bg-[#552583]/5"
                                )}>
                                    <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-[#FDB927]" : "text-zinc-600 group-hover:text-[#FDB927]")} />
                                    {item.label}
                                    {active && <ChevronRight className="w-3 h-3 ml-auto text-[#FDB927]" />}
                                </a>
                            </Link>
                        );
                    })}
                </nav>
                {/* User footer */}
                <div className="p-4 border-t border-[#552583]/20">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#552583]/5 border border-[#552583]/20 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#552583] to-[#FDB927] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {adminUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{adminUser?.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                {role === "admin"
                                    ? <><Shield className="w-3 h-3 text-[#FDB927]" /><span className="text-xs text-[#FDB927]">Admin</span></>
                                    : <><Eye className="w-3 h-3 text-[#FDB927]" /><span className="text-xs text-[#FDB927]">Viewer</span></>}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout}
                        className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 gap-2 justify-start">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* ── MOBILE Slide-out Drawer ──────────────────────── */}
            {drawerOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    {/* Drawer panel */}
                    <div className="relative w-72 bg-gradient-to-b from-[#1a0a2e] via-[#2a1052]/60 to-zinc-950 border-r border-[#552583]/30 flex flex-col h-full shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#552583]/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center">
                                    <span className="text-white font-black text-xs">OMS</span>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">One More Swing</p>
                                    <p className="text-[#FDB927]/60 text-xs">Command Center</p>
                                </div>
                            </div>
                            <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {/* User card */}
                        <div className="px-4 py-3 border-b border-zinc-800/60">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#552583]/10 border border-[#552583]/20">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#552583] to-[#FDB927] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {adminUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{adminUser?.name}</p>
                                    <span className="text-[#FDB927] text-xs">{role === "admin" ? "Admin" : "Viewer"}</span>
                                </div>
                            </div>
                        </div>
                        {/* Nav */}
                        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                            {navItems.map(item => {
                                const active = isActive(item.href);
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <a className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                            active
                                                ? "bg-gradient-to-r from-[#552583]/30 to-[#FDB927]/10 text-[#FDB927] border border-[#552583]/40"
                                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                                        )}>
                                            <item.icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-[#FDB927]" : "text-zinc-600")} />
                                            {item.label}
                                            {active && <ChevronRight className="w-4 h-4 ml-auto text-[#FDB927]" />}
                                        </a>
                                    </Link>
                                );
                            })}
                        </nav>
                        {/* Sign out */}
                        <div className="p-4 border-t border-zinc-800">
                            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                                <LogOut className="w-5 h-5" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────── */}
            <main className="flex-1 overflow-auto bg-zinc-950 min-w-0">

                {/* Top bar */}
                <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-[#552583]/10 px-4 lg:px-8 py-3 flex items-center justify-between">
                    {/* Mobile: hamburger + page title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#552583]/10 border border-[#552583]/20 text-[#FDB927]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="hidden lg:inline text-zinc-600">One More Swing /</span>
                            <span className="text-zinc-300 font-semibold text-sm lg:text-xs lg:text-zinc-400 lg:font-medium">{capitalizedLabel}</span>
                        </div>
                    </div>
                    {/* Right: user info */}
                    <div className="flex items-center gap-2 lg:gap-4 text-xs">
                        <span className="hidden sm:inline text-[#FDB927] font-semibold">{adminUser?.name}</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#552583]/10 border border-[#552583]/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FDB927] animate-pulse" />
                            <span className="text-[#FDB927] font-medium">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Page content — extra bottom padding on mobile for bottom nav */}
                <div className="p-4 lg:p-8 mx-auto max-w-7xl pb-24 lg:pb-8">
                    {children}
                </div>
            </main>

            {/* ── MOBILE Bottom Tab Bar ────────────────────────── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-[#552583]/20 safe-area-pb">
                <div className="flex items-stretch h-16">
                    {mobileTabItems.map(item => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <a className={cn(
                                    "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all relative min-w-0 h-full",
                                    active ? "text-[#FDB927]" : "text-zinc-600"
                                )}>
                                    {active && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#FDB927]" />
                                    )}
                                    <item.icon className={cn("w-5 h-5", active ? "text-[#FDB927]" : "text-zinc-600")} />
                                    <span className="truncate">{item.label}</span>
                                </a>
                            </Link>
                        );
                    })}
                    {/* "More" tab opens drawer */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-zinc-600 h-full min-w-0"
                    >
                        <Menu className="w-5 h-5" />
                        <span>More</span>
                    </button>
                </div>
            </nav>

        </div>
    );
}
