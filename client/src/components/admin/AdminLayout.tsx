import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Settings, LogOut, Lock, DollarSign, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [location] = useLocation();

    useEffect(() => {
        const saved = localStorage.getItem("admin_pass");
        if (saved === (import.meta.env.VITE_ADMIN_PASSWORD || "swing-admin-2024")) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "swing-admin-2024";
        if (password === adminPass) {
            localStorage.setItem("admin_pass", password);
            setIsAuthenticated(true);
        } else {
            alert("Invalid Password");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_pass");
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Command Center</CardTitle>
                        <p className="text-zinc-400 mt-2">Enter your master password to continue</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Master Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                autoFocus
                            />
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Authorize Access
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const navItems = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/leads", label: "Leads", icon: Users },
        { href: "/admin/sales", label: "Sales", icon: DollarSign },
        { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-green-500">OMS</span> Command
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <a className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                location === item.href
                                    ? "bg-green-500/10 text-green-500"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}>
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </a>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/5"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}
