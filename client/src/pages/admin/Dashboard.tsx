import { useQuery } from "@tanstack/react-query";
import { getAdminQueryFn } from "@/lib/queryClient";
import { type Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, DollarSign, Zap, Mail, Calendar, Loader2, ArrowUp, Phone, ArrowRight } from "lucide-react";
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
    new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl">
            <p className="text-zinc-400 mb-1">{label}</p>
            <p className="text-green-400 font-bold">{payload[0]?.value} leads</p>
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
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
    );

    const kpis = [
        {
            label: "Total Leads",
            value: stats?.totalLeads || 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            onClick: () => navigate("/admin/leads"),
        },
        {
            label: "Uncontacted",
            value: stats?.newLeads || 0,
            icon: Zap,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            onClick: () => navigate("/admin/leads"),
        },
        {
            label: "Confirmed Revenue",
            value: `$${(stats?.confirmedRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            onClick: () => navigate("/admin/sales"),
        },
        {
            label: "Avg. Deal Size",
            value: `$${(stats?.avgDealSize || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            onClick: () => navigate("/admin/sales"),
        },
    ];

    // Format daily lead chart data
    const chartData = (stats?.dailyLeads || []).map((d) => ({
        date: format(new Date(d.date), "MMM d"),
        count: d.count,
    }));

    // Priority leads = newest uncontacted
    const priorityLeads = leads
        .filter((l) => l.status === "new" || l.status === "contacted")
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Command Center</h2>
                    <p className="text-zinc-400 mt-1">Live overview of your business performance</p>
                </div>
                <div className="text-sm text-zinc-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <Card
                        key={kpi.label}
                        className="bg-zinc-900 border-zinc-800 group hover:border-green-500/30 hover:bg-zinc-800/50 transition-all cursor-pointer"
                        onClick={kpi.onClick}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{kpi.label}</CardTitle>
                            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{kpi.value}</div>
                            <div className="flex items-center gap-1 text-xs text-zinc-600 mt-1 group-hover:text-zinc-400 transition-colors">
                                View details <ArrowRight className="w-3 h-3" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Lead Trend Chart */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <CardHeader className="px-0 pt-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Lead Volume (Last 30 Days)</CardTitle>
                            <p className="text-sm text-zinc-500 mt-1">Daily incoming booking requests</p>
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                            <ArrowUp className="w-4 h-4" /> Tracking Live
                        </div>
                    </div>
                </CardHeader>
                <div className="h-[240px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#71717a" fontSize={11} tickLine={false} axisLine={false}
                                interval={4}
                            />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                fill="url(#leadGradient)"
                                dot={false}
                                activeDot={{ r: 5, fill: "#22c55e" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Priority Leads Panel */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> Priority Leads
                            </CardTitle>
                            <p className="text-sm text-zinc-500 mt-1">Click any lead to view full details</p>
                        </div>
                        <button onClick={() => navigate("/admin/leads")} className="text-xs text-zinc-500 hover:text-green-400 flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {priorityLeads.length === 0 ? (
                        <p className="text-zinc-500 text-sm py-4 text-center">🎉 All leads have been contacted!</p>
                    ) : priorityLeads.map((lead) => (
                        <button
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 hover:border-green-500/20 border border-transparent transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                    {lead.firstName[0]}{lead.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{lead.firstName} {lead.lastName}</p>
                                    <p className="text-zinc-500 text-xs">{lead.email}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <Badge className={`text-xs mb-1 border ${STATUS_COLORS[lead.status] || ""}`}>
                                    {lead.status.toUpperCase()}
                                </Badge>
                                <p className="text-zinc-500 text-xs flex items-center gap-1 justify-end">
                                    <Calendar className="w-3 h-3" />{lead.eventDate}
                                </p>
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Lead Detail Modal */}
            <Dialog open={!!selectedLead} onOpenChange={o => !o && setSelectedLead(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {selectedLead?.firstName} {selectedLead?.lastName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLead && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2 text-zinc-300"><Mail className="w-4 h-4 text-zinc-500" />{selectedLead.email}</p>
                                    <p className="flex items-center gap-2 text-zinc-300"><Phone className="w-4 h-4 text-zinc-500" />{selectedLead.phone}</p>
                                    <p className="flex items-center gap-2 text-zinc-300"><Calendar className="w-4 h-4 text-zinc-500" />{selectedLead.eventDate}</p>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-zinc-500">Package</p>
                                    <p className="text-white font-medium">{selectedLead.package}</p>
                                    <p className="text-zinc-500 mt-2">Event Type</p>
                                    <p className="text-white">{selectedLead.eventType}</p>
                                </div>
                            </div>
                            {selectedLead.message && (
                                <p className="text-zinc-400 text-sm italic border-t border-zinc-800 pt-3">"{selectedLead.message}"</p>
                            )}
                            <button
                                onClick={() => { navigate("/admin/leads"); setSelectedLead(null); }}
                                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
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
