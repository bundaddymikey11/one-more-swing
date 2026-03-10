import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Settings, LogOut, Lock, DollarSign, Megaphone, Shield, Eye, ChevronRight, Receipt, Scale } from "lucide-react";
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
    { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["admin", "viewer"] },
    { href: "/admin/leads", label: "Leads", icon: Users, roles: ["admin", "viewer"] },
    { href: "/admin/sales", label: "Sales", icon: DollarSign, roles: ["admin"] },
    { href: "/admin/marketing", label: "Marketing", icon: Megaphone, roles: ["admin"] },
    { href: "/admin/expenses", label: "Expenses", icon: Receipt, roles: ["admin"] },
    { href: "/admin/legal", label: "Legal", icon: Scale, roles: ["admin"] },
    { href: "/admin/users", label: "Team", icon: Shield, roles: ["admin"] },
    { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin", "viewer"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authed, setAuthed] = useState(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [location] = useLocation();

    useEffect(() => {
        const pass = localStorage.getItem("admin_pass");
        const storedUser = localStorage.getItem("admin_user");
        if (pass && storedUser) {
            try {
                setAdminUser(JSON.parse(storedUser));
                setAuthed(true);
            } catch { logout(); }
        }
    }, []);

    const handleLogin = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                setError("Invalid password. Please try again.");
                return;
            }
            const user: AdminUser = await res.json();
            localStorage.setItem("admin_pass", password);
            localStorage.setItem("admin_role", user.role);
            localStorage.setItem("admin_user", JSON.stringify(user));
            setAdminUser(user);
            setAuthed(true);
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
        setAuthed(false);
        setAdminUser(null);
        setPassword("");
    };

    if (!authed) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#552583]/20 via-black to-black" />
                {/* Decorative gold ring */}
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
                        {error && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}
                        <Button
                            onClick={handleLogin}
                            disabled={!password || loading}
                            className="w-full h-11 bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-[#FDB927] rounded-full animate-spin" /> Signing in...</div>
                            ) : (
                                <div className="flex items-center gap-2">Sign In <ChevronRight className="w-4 h-4" /></div>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const role = adminUser?.role || "viewer";
    const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));

    const isActive = (href: string) => {
        if (href === "/admin") return location === "/admin";
        return location.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-[#1a0a2e] via-[#2a1052]/40 to-zinc-950 border-r border-[#552583]/20 flex flex-col flex-shrink-0 sticky top-0 h-screen">
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 gap-2 justify-start"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
