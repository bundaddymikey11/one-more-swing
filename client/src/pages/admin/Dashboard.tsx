import { useQuery } from "@tanstack/react-query";
import { getAdminQueryFn } from "@/lib/queryClient";
import { type Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, DollarSign, Zap, Mail, Calendar, Loader2, ArrowUp, Phone, ArrowRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { useLocation } from "wouter";

interface Stats {
    totalLeads: number;
    newLeads: number;
    confirmedRevenue: number;
    pipelineRevenue: number;
    avgDealSize: number;
    dailyLeads: { date: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
    new: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    contacted: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
    completed: "bg-zinc-500/10 text-zinc-400 border-zinc-700",
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 border border-violet-500/20 rounded-xl p-3 text-sm shadow-xl shadow-violet-950/50">
            <p className="text-zinc-400 mb-1">{label}</p>
            <p className="text-yellow-400 font-bold text-lg">{payload[0]?.value} leads</p>
        </div>
    );
};

export default function Dashboard() {
    const [, navigate] = useLocation();
    const [selectedLead, setSelectedLead] = useState<Booking | null>(null);

    const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
        queryKey: ["/api/admin/stats"],
        queryFn: getAdminQueryFn(),
    });

    const { data: leads = [], isLoading: leadsLoading } = useQuery<Booking[]>({
        queryKey: ["/api/bookings"],
        queryFn: getAdminQueryFn(),
    });

    if (statsLoading || leadsLoading) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-violet-400/60 text-sm animate-pulse">Loading Command Center...</p>
            </div>
        </div>
    );

    const kpis = [
        {
            label: "Total Leads",
            value: stats?.totalLeads || 0,
            icon: Users,
            gradient: "from-violet-600 to-violet-800",
            iconColor: "text-violet-200",
            onClick: () => navigate("/admin/leads"),
        },
        {
            label: "Uncontacted",
            value: stats?.newLeads || 0,
            icon: Zap,
            gradient: "from-yellow-500 to-amber-600",
            iconColor: "text-yellow-100",
            onClick: () => navigate("/admin/leads"),
        },
        {
            label: "Confirmed Revenue",
            value: `$${(stats?.confirmedRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            gradient: "from-violet-500 to-purple-700",
            iconColor: "text-violet-100",
            onClick: () => navigate("/admin/sales"),
        },
        {
            label: "Avg. Deal Size",
            value: `$${(stats?.avgDealSize || 0).toLocaleString()}`,
            icon: TrendingUp,
            gradient: "from-yellow-600 to-orange-600",
            iconColor: "text-yellow-100",
            onClick: () => navigate("/admin/sales"),
        },
    ];

    const chartData = (stats?.dailyLeads || []).map((d) => ({
        date: format(new Date(d.date), "MMM d"),
        count: d.count,
    }));

    const priorityLeads = leads
        .filter((l) => l.status === "new" || l.status === "contacted")
        .slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-300 to-yellow-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Crown className="w-8 h-8 text-yellow-500" />
                        Command Center
                    </h2>
                    <p className="text-zinc-500 mt-1">Live overview of your business performance</p>
                </div>
                <div className="text-sm text-violet-400/50">{format(new Date(), "EEEE, MMMM d, yyyy")}</div>
            </div>

            {/* KPI Cards — gradient cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        onClick={kpi.onClick}
                        className="relative rounded-2xl p-[1px] cursor-pointer group overflow-hidden"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-yellow-500/0 group-hover:from-violet-500/20 group-hover:to-yellow-500/20 transition-all duration-500 rounded-2xl" />
                        <div className={`relative rounded-2xl bg-gradient-to-br ${kpi.gradient} p-5 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{kpi.label}</p>
                                <kpi.icon className={`w-5 h-5 ${kpi.iconColor} opacity-80`} />
                            </div>
                            <p className="text-3xl font-black text-white">{kpi.value}</p>
                            <div className="flex items-center gap-1 text-xs text-white/40 mt-2 group-hover:text-white/70 transition-colors">
                                View details <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lead Trend Chart */}
            <Card className="bg-zinc-900/80 border-violet-500/10 p-6 shadow-lg shadow-violet-950/20">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white text-lg">Lead Volume — Last 30 Days</CardTitle>
                            <p className="text-sm text-zinc-500 mt-1">Daily incoming booking requests</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span className="text-xs text-violet-300 font-medium">Live</span>
                        </div>
                    </div>
                </CardHeader>
                <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="lakersGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#eab308" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#52525b" fontSize={11} tickLine={false} axisLine={false}
                                interval={4}
                            />
                            <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#eab308"
                                strokeWidth={2.5}
                                fill="url(#lakersGradient)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#eab308", stroke: "#7c3aed", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Priority Leads Panel */}
            <Card className="bg-zinc-900/80 border-violet-500/10 shadow-lg shadow-violet-950/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> Priority Leads
                            </CardTitle>
                            <p className="text-sm text-zinc-500 mt-1">Click any lead to view full details</p>
                        </div>
                        <button onClick={() => navigate("/admin/leads")} className="text-xs text-violet-400 hover:text-yellow-400 flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {priorityLeads.length === 0 ? (
                        <div className="text-center py-8">
                            <Crown className="w-8 h-8 text-yellow-500/30 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">🎉 All leads have been contacted!</p>
                        </div>
                    ) : priorityLeads.map((lead) => (
                        <button
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-violet-500/5 hover:border-violet-500/20 border border-transparent transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-yellow-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md">
                                    {lead.firstName[0]}{lead.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold group-hover:text-yellow-400 transition-colors">{lead.firstName} {lead.lastName}</p>
                                    <p className="text-zinc-500 text-xs">{lead.email}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <Badge className={`text-xs mb-1 border ${STATUS_COLORS[lead.status] || ""}`}>
                                    {lead.status.toUpperCase()}
                                </Badge>
                                <p className="text-zinc-600 text-xs flex items-center gap-1 justify-end">
                                    <Calendar className="w-3 h-3" />{lead.eventDate}
                                </p>
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Lead Detail Modal */}
            <Dialog open={!!selectedLead} onOpenChange={o => !o && setSelectedLead(null)}>
                <DialogContent className="bg-zinc-900 border-violet-500/20 text-white sm:max-w-[500px] shadow-2xl shadow-violet-950/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-yellow-400 bg-clip-text text-transparent">
                            {selectedLead?.firstName} {selectedLead?.lastName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLead && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <p className="flex items-center gap-2 text-zinc-300"><Mail className="w-4 h-4 text-violet-400" />{selectedLead.email}</p>
                                    <p className="flex items-center gap-2 text-zinc-300"><Phone className="w-4 h-4 text-violet-400" />{selectedLead.phone}</p>
                                    <p className="flex items-center gap-2 text-zinc-300"><Calendar className="w-4 h-4 text-violet-400" />{selectedLead.eventDate}</p>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-500">Package</p>
                                    <p className="text-yellow-400 font-medium">{selectedLead.package}</p>
                                    <p className="text-zinc-500 mt-2">Event Type</p>
                                    <p className="text-white">{selectedLead.eventType}</p>
                                </div>
                            </div>
                            {selectedLead.message && (
                                <p className="text-zinc-400 text-sm italic border-t border-violet-500/10 pt-3">"{selectedLead.message}"</p>
                            )}
                            <button
                                onClick={() => { navigate("/admin/leads"); setSelectedLead(null); }}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold text-sm transition-all shadow-lg shadow-violet-600/20"
                            >
                                Open Full Record →
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
