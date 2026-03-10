import { useQuery } from "@tanstack/react-query";
import { getAdminQueryFn } from "@/lib/queryClient";
import { type Booking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
    Users, TrendingUp, DollarSign, Zap, Mail, Calendar, Loader2,
    Phone, ArrowRight, Crown, Target, Activity, CheckCircle2,
    Clock3, Star, ArrowUpRight, ArrowDownRight, Flame, Trophy,
    ChevronRight, BarChart2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, subDays, parseISO } from "date-fns";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

interface Stats {
    totalLeads: number;
    newLeads: number;
    confirmedRevenue: number;
    pipelineRevenue: number;
    avgDealSize: number;
    dailyLeads: { date: string; count: number }[];
    forecast?: { month: string; value: number }[];
    funnel?: Record<string, number>;
    byPackage?: { name: string; count: number; revenue: number }[];
}

const LAKERS_PURPLE = "#552583";
const LAKERS_GOLD = "#FDB927";

const STATUS_META: Record<string, { label: string; color: string; bg: string; next: string }> = {
    new: { label: "New", color: "text-[#FDB927]", bg: "bg-[#FDB927]/10", next: "Contact Now" },
    contacted: { label: "Contacted", color: "text-[#552583]", bg: "bg-[#552583]/10", next: "Send Quote" },
    confirmed: { label: "Confirmed", color: "text-green-400", bg: "bg-green-500/10", next: "Collect Deposit" },
    completed: { label: "Done", color: "text-zinc-400", bg: "bg-zinc-800", next: "Request Review" },
    cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10", next: "" },
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-950 border border-[#552583]/30 rounded-xl p-3 text-sm shadow-2xl">
            <p className="text-zinc-400 text-xs mb-1">{label}</p>
            <p className="font-bold text-[#FDB927] text-lg">{payload[0]?.value} leads</p>
        </div>
    );
};

function StatCard({
    label, value, sub, icon: Icon, gradient, trend, onClick,
}: {
    label: string; value: string | number; sub?: string;
    icon: any; gradient: string; trend?: number; onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`relative rounded-2xl overflow-hidden ${onClick ? "cursor-pointer" : ""} group`}
        >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            <div className={`${gradient} p-5 h-full shadow-lg group-hover:shadow-xl transition-shadow`}>
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? "bg-white/20 text-white" : "bg-black/20 text-white/70"}`}>
                            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl font-black text-white leading-none">{value}</p>
                {sub && <p className="text-white/50 text-xs mt-2">{sub}</p>}
                {onClick && (
                    <div className="flex items-center gap-1 text-white/40 text-xs mt-3 group-hover:text-white/70 transition-colors">
                        View details <ArrowRight className="w-3 h-3" />
                    </div>
                )}
            </div>
        </div>
    );
}

function PipelineStage({ label, count, total, color, bg }: { label: string; count: number; total: number; color: string; bg: string }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">{label}</span>
                <span className="font-bold text-white">{count} <span className="text-zinc-600 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                    className={`h-full rounded-full ${bg} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

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

    const metrics = useMemo(() => {
        const total = leads.length;
        const confirmed = leads.filter(l => l.status === "confirmed" || l.status === "completed").length;
        const winRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
        const pipeline = leads.filter(l => ["new", "contacted"].includes(l.status)).length;
        const byStatus: Record<string, number> = {};
        leads.forEach(l => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });
        // Recent 7-day activity
        const cutoff = subDays(new Date(), 7);
        const recentLeads = leads.filter(l => new Date(l.createdAt) > cutoff).length;
        return { total, confirmed, winRate, pipeline, byStatus, recentLeads };
    }, [leads]);

    const chartData = useMemo(() => {
        return (stats?.dailyLeads || []).map(d => ({
            date: format(new Date(d.date), "MMM d"),
            count: d.count,
        }));
    }, [stats]);

    const priorityLeads = useMemo(() =>
        leads.filter(l => l.status === "new" || l.status === "contacted").slice(0, 5),
        [leads]
    );

    const recentActivity = useMemo(() =>
        [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
        [leads]
    );

    const REVENUE_GOAL = parseInt(localStorage.getItem("oms_revenue_goal") || "50000", 10);
    const revenueProgress = Math.min(100, Math.round(((stats?.confirmedRevenue || 0) / REVENUE_GOAL) * 100));

    if (statsLoading || leadsLoading) return (
        <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center mx-auto shadow-lg animate-pulse">
                    <Crown className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#FDB927]/60 text-sm font-medium animate-pulse">Loading your Command Center...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-7">

            {/* ── Header ───────────────────────────────────── */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center shadow-md shadow-[#552583]/30">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Executive Overview</h1>
                    </div>
                    <p className="text-zinc-500 text-sm ml-12">{format(new Date(), "EEEE, MMMM d, yyyy")} · One More Swing</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#552583]/10 border border-[#552583]/20">
                    <div className="w-2 h-2 rounded-full bg-[#FDB927] animate-pulse" />
                    <span className="text-xs text-[#FDB927] font-semibold">LIVE</span>
                </div>
            </div>

            {/* ── KPI Grid ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue" icon={DollarSign}
                    value={`$${(stats?.confirmedRevenue || 0).toLocaleString()}`}
                    sub={`$${(stats?.pipelineRevenue || 0).toLocaleString()} in pipeline`}
                    gradient="bg-gradient-to-br from-[#552583] to-[#3d1a63]"
                    trend={12} onClick={() => navigate("/admin/sales")}
                />
                <StatCard
                    label="Active Pipeline" icon={Flame}
                    value={metrics.pipeline}
                    sub={`${metrics.recentLeads} new this week`}
                    gradient="bg-gradient-to-br from-[#FDB927] to-[#e0a520]"
                    trend={8} onClick={() => navigate("/admin/leads")}
                />
                <StatCard
                    label="Win Rate" icon={Trophy}
                    value={`${metrics.winRate}%`}
                    sub={`${metrics.confirmed} of ${metrics.total} converted`}
                    gradient="bg-gradient-to-br from-[#552583] via-[#6b2fa0] to-[#FDB927]"
                    trend={3}
                />
                <StatCard
                    label="Avg. Deal" icon={TrendingUp}
                    value={`$${(stats?.avgDealSize || 0).toLocaleString()}`}
                    sub="Per confirmed booking"
                    gradient="bg-gradient-to-br from-zinc-800 to-zinc-900"
                    trend={-2} onClick={() => navigate("/admin/sales")}
                />
            </div>

            {/* ── Revenue Goal Progress ─────────────────────── */}
            <div className="bg-zinc-900/60 border border-[#552583]/20 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#FDB927]" />
                        <span className="text-white font-semibold text-sm">Revenue Goal — 2026</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-white">${(stats?.confirmedRevenue || 0).toLocaleString()}</span>
                        <span className="text-zinc-500 text-sm"> / ${REVENUE_GOAL.toLocaleString()}</span>
                    </div>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#552583] to-[#FDB927] transition-all duration-1000 shadow-lg shadow-[#FDB927]/20"
                        style={{ width: `${revenueProgress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                    <span>{revenueProgress}% of annual goal achieved</span>
                    <span>${(REVENUE_GOAL - (stats?.confirmedRevenue || 0)).toLocaleString()} remaining</span>
                </div>
            </div>

            {/* ── Main 2-col layout ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Lead Volume Chart — 2/3 width */}
                <div className="lg:col-span-2 bg-zinc-900/60 border border-[#552583]/20 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-[#FDB927]" /> Lead Volume — Last 30 Days
                            </h3>
                            <p className="text-zinc-500 text-xs mt-0.5">Incoming booking requests per day</p>
                        </div>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="ceoGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={LAKERS_PURPLE} stopOpacity={0.5} />
                                        <stop offset="60%" stopColor={LAKERS_GOLD} stopOpacity={0.08} />
                                        <stop offset="100%" stopColor={LAKERS_PURPLE} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} interval={5} />
                                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomAreaTooltip />} />
                                <Area type="monotone" dataKey="count" stroke={LAKERS_GOLD} strokeWidth={2.5}
                                    fill="url(#ceoGradient)" dot={false}
                                    activeDot={{ r: 5, fill: LAKERS_GOLD, stroke: LAKERS_PURPLE, strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pipeline Funnel — 1/3 width */}
                <div className="bg-zinc-900/60 border border-[#552583]/20 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-5">
                        <Activity className="w-4 h-4 text-[#FDB927]" /> Sales Pipeline
                    </h3>
                    <div className="space-y-4">
                        <PipelineStage label="🆕 New Leads" count={metrics.byStatus["new"] || 0} total={metrics.total} color="text-[#FDB927]" bg="bg-[#FDB927]" />
                        <PipelineStage label="📞 Contacted" count={metrics.byStatus["contacted"] || 0} total={metrics.total} color="text-[#552583]" bg="bg-[#552583]" />
                        <PipelineStage label="✅ Confirmed" count={metrics.byStatus["confirmed"] || 0} total={metrics.total} color="text-green-500" bg="bg-green-500" />
                        <PipelineStage label="🏁 Completed" count={metrics.byStatus["completed"] || 0} total={metrics.total} color="text-zinc-400" bg="bg-zinc-500" />
                        <PipelineStage label="❌ Cancelled" count={metrics.byStatus["cancelled"] || 0} total={metrics.total} color="text-red-400" bg="bg-red-500" />
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-3 text-center">
                        <div>
                            <p className="text-2xl font-black text-[#FDB927]">{metrics.winRate}%</p>
                            <p className="text-xs text-zinc-500">Win Rate</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{metrics.total}</p>
                            <p className="text-xs text-zinc-500">All Time Leads</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Priority Leads + Activity Feed ───────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Priority Leads */}
                <div className="bg-zinc-900/60 border border-[#552583]/20 rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#FDB927]" /> Priority Leads
                        </h3>
                        <button onClick={() => navigate("/admin/leads")} className="text-xs text-[#FDB927]/60 hover:text-[#FDB927] flex items-center gap-1 transition-colors">
                            All leads <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                        {priorityLeads.length === 0 ? (
                            <div className="p-8 text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500/40 mx-auto mb-2" />
                                <p className="text-zinc-500 text-sm">All leads contacted — great work! 🎉</p>
                            </div>
                        ) : priorityLeads.map(lead => {
                            const meta = STATUS_META[lead.status] || STATUS_META.new;
                            return (
                                <button
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#552583]/5 transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-md">
                                        {lead.firstName[0]}{lead.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-semibold group-hover:text-[#FDB927] transition-colors">{lead.firstName} {lead.lastName}</p>
                                        <p className="text-zinc-500 text-xs truncate">{lead.package} · {lead.eventDate}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                        {meta.next && <p className="text-[#FDB927]/50 text-xs mt-1 group-hover:text-[#FDB927] transition-colors">→ {meta.next}</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-zinc-900/60 border border-[#552583]/20 rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Clock3 className="w-4 h-4 text-[#FDB927]" /> Recent Activity
                        </h3>
                        <span className="text-xs text-zinc-500">{recentActivity.length} bookings</span>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                        {recentActivity.length === 0 ? (
                            <div className="p-8 text-center">
                                <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                <p className="text-zinc-500 text-sm">No activity yet</p>
                            </div>
                        ) : recentActivity.map(lead => {
                            const meta = STATUS_META[lead.status] || STATUS_META.new;
                            const daysAgo = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <button
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-[#552583]/5 transition-colors group text-left"
                                >
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.bg.replace('/10', '')} ${meta.color.replace('text-', 'bg-')}`}
                                        style={{ backgroundColor: lead.status === 'new' ? LAKERS_GOLD : lead.status === 'confirmed' ? '#22c55e' : lead.status === 'completed' ? '#71717a' : '#552583' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium group-hover:text-[#FDB927] transition-colors">{lead.firstName} {lead.lastName}</p>
                                        <p className="text-zinc-500 text-xs">{lead.package}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`text-xs ${meta.color}`}>{meta.label}</span>
                                        <p className="text-zinc-600 text-xs">{daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Package Performance ───────────────────────── */}
            {stats?.byPackage && stats.byPackage.length > 0 && (
                <div className="bg-zinc-900/60 border border-[#552583]/20 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-5">
                        <Star className="w-4 h-4 text-[#FDB927]" /> Package Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.byPackage.slice(0, 3).map((pkg, i) => (
                            <div key={pkg.name} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-[#552583]/30 transition-colors">
                                <div className="w-10 h-10 rounded-xl text-white font-black text-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: i === 0 ? `linear-gradient(135deg,${LAKERS_GOLD},#e0a520)` : i === 1 ? `linear-gradient(135deg,${LAKERS_PURPLE},#3d1a63)` : "linear-gradient(135deg,#27272a,#18181b)" }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">{pkg.name}</p>
                                    <p className="text-zinc-500 text-xs">{pkg.count} booking{pkg.count !== 1 ? "s" : ""}</p>
                                </div>
                                <p className="text-[#FDB927] font-bold text-sm flex-shrink-0">${(pkg.revenue || 0).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Lead Detail Modal ─────────────────────────── */}
            <Dialog open={!!selectedLead} onOpenChange={o => !o && setSelectedLead(null)}>
                <DialogContent className="bg-zinc-950 border border-[#552583]/30 text-white sm:max-w-[520px] shadow-2xl shadow-black/80 p-0 overflow-hidden">
                    {/* Modal header */}
                    <div className="bg-gradient-to-r from-[#552583] to-[#3d1a63] p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-black text-white">
                                {selectedLead?.firstName[0]}{selectedLead?.lastName[0]}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-white">{selectedLead?.firstName} {selectedLead?.lastName}</DialogTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_META[selectedLead?.status || "new"]?.bg} ${STATUS_META[selectedLead?.status || "new"]?.color}`}>
                                        {STATUS_META[selectedLead?.status || "new"]?.label}
                                    </span>
                                    <span className="text-white/50 text-xs">{selectedLead?.package}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Modal body */}
                    {selectedLead && (
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { icon: Mail, label: "Email", val: selectedLead.email },
                                    { icon: Phone, label: "Phone", val: selectedLead.phone },
                                    { icon: Calendar, label: "Event Date", val: selectedLead.eventDate },
                                    { icon: Clock3, label: "Start Time", val: selectedLead.startTime },
                                ].map(({ icon: Icon, label, val }) => (
                                    <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                                        <Icon className="w-4 h-4 text-[#FDB927] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-zinc-500 text-xs">{label}</p>
                                            <p className="text-white text-xs font-medium">{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {selectedLead.message && (
                                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                    <p className="text-zinc-500 text-xs mb-1">Client Message</p>
                                    <p className="text-zinc-300 text-sm italic">"{selectedLead.message}"</p>
                                </div>
                            )}
                            {selectedLead.internalNotes && (
                                <div className="p-4 rounded-xl bg-[#552583]/5 border border-[#552583]/20">
                                    <p className="text-[#FDB927] text-xs mb-1 font-semibold">Internal Notes</p>
                                    <p className="text-zinc-300 text-sm">{selectedLead.internalNotes}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { navigate("/admin/leads"); setSelectedLead(null); }}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold text-sm transition-all shadow-lg shadow-[#552583]/20"
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
