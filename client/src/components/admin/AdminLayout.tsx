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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-950/20 via-black to-black" />
                <Card className="relative w-full max-w-md bg-zinc-900/80 border-zinc-800 shadow-2xl backdrop-blur">
                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mx-auto mb-4">
                            <Lock className="w-6 h-6 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Command Center</CardTitle>
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
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 h-11"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                        )}
                        <Button
                            onClick={handleLogin}
                            disabled={!password || loading}
                            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</div>
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
            <aside className="w-64 bg-black border-r border-zinc-900 flex flex-col flex-shrink-0 sticky top-0 h-screen">
                {/* Logo */}
                <div className="p-6 border-b border-zinc-900">
                    <p className="text-white font-bold text-lg tracking-tight">One More Swing</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Command Center</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <a className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                                    active
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                )}>
                                    <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-green-500" : "text-zinc-500 group-hover:text-white")} />
                                    {item.label}
                                    {active && <ChevronRight className="w-3 h-3 ml-auto text-green-500" />}
                                </a>
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-zinc-900">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-zinc-900/50 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {adminUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{adminUser?.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                {role === "admin"
                                    ? <><Shield className="w-3 h-3 text-green-500" /><span className="text-xs text-green-500">Admin</span></>
                                    : <><Eye className="w-3 h-3 text-blue-400" /><span className="text-xs text-blue-400">Viewer</span></>}
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
