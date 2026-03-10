import { useQuery } from "@tanstack/react-query";
import { getAdminQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Loader2, TrendingDown, TrendingUp, Megaphone, ArrowRight } from "lucide-react";

interface Stats {
    totalLeads: number;
    funnel: { new: number; contacted: number; confirmed: number; completed: number; cancelled: number };
    dayOfWeek: { day: string; count: number }[];
    byPackage: Record<string, number>;
}

const FUNNEL_STAGES = [
    { key: "new", label: "New Leads", color: "#3b82f6" },
    { key: "contacted", label: "Contacted", color: "#f59e0b" },
    { key: "confirmed", label: "Confirmed", color: "#552583" },
    { key: "completed", label: "Completed", color: "#552583" },
];

const PACKAGE_COLORS = ["#552583", "#3b82f6", "#552583"];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl">
            <p className="text-zinc-300 font-semibold mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color || "#fff" }}>
                    {p.name}: <span className="font-bold">{p.value} leads</span>
                </p>
            ))}
        </div>
    );
};

export default function MarketingPage() {
    const { data: stats, isLoading } = useQuery<Stats>({
        queryKey: ["/api/admin/stats"],
        queryFn: getAdminQueryFn(),
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
    );

    const funnel = stats?.funnel || { new: 0, contacted: 0, confirmed: 0, completed: 0, cancelled: 0 };
    const total = stats?.totalLeads || 1;

    const funnelData = FUNNEL_STAGES.map((stage) => ({
        ...stage,
        count: funnel[stage.key as keyof typeof funnel],
        pct: Math.round(((funnel[stage.key as keyof typeof funnel] || 0) / total) * 100),
    }));

    const packageData = Object.entries(stats?.byPackage || {}).map(([name, value]) => ({ name, value }));

    const bestDay = [...(stats?.dayOfWeek || [])].sort((a, b) => b.count - a.count)[0]?.day;
    const conversionRate = total > 0 ? Math.round(((funnel.confirmed + funnel.completed) / total) * 100) : 0;
    const cancelRate = total > 0 ? Math.round((funnel.cancelled / total) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Marketing</h2>
                <p className="text-zinc-400 mt-1">Lead funnel, demand patterns, and audience insights</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-zinc-400">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <p className="text-4xl font-bold text-green-500">{conversionRate}%</p>
                            <TrendingUp className="w-6 h-6 text-green-500 mb-1" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Leads confirmed or completed</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-zinc-400">Cancellation Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <p className="text-4xl font-bold text-red-500">{cancelRate}%</p>
                            <TrendingDown className="w-6 h-6 text-red-500 mb-1" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Leads marked as cancelled</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-zinc-400">Peak Request Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <p className="text-4xl font-bold text-[#FDB927]">{bestDay || "—"}</p>
                            <Megaphone className="w-6 h-6 text-[#FDB927] mb-1" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Most leads received this day</p>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Funnel */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-white">Lead Conversion Funnel</CardTitle>
                    <p className="text-sm text-zinc-500">How leads move through your sales pipeline</p>
                </CardHeader>
                <div className="space-y-3 mt-4">
                    {funnelData.map((stage, i) => (
                        <div key={stage.key} className="flex items-center gap-4">
                            <div className="w-24 text-right">
                                <p className="text-sm font-medium text-zinc-300">{stage.label}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                                <div className="flex-1 h-10 bg-zinc-800 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full rounded-lg flex items-center pl-3 transition-all duration-700"
                                        style={{
                                            width: `${Math.max(2, (stage.count / total) * 100)}%`,
                                            backgroundColor: stage.color,
                                        }}
                                    >
                                        <span className="text-white text-xs font-bold">{stage.count}</span>
                                    </div>
                                </div>
                                <span className="text-zinc-500 text-sm w-10 text-right">{stage.pct}%</span>
                            </div>
                            {i < funnelData.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Day of Week + Package Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-white">Best Booking Days</CardTitle>
                        <p className="text-sm text-zinc-500">Leads received by day of the week</p>
                    </CardHeader>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.dayOfWeek || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                                    {(stats?.dayOfWeek || []).map((entry, i) => (
                                        <Cell key={i} fill={entry.day === bestDay ? "#552583" : "#27272a"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-white">Package Popularity</CardTitle>
                        <p className="text-sm text-zinc-500">Most-requested packages at a glance</p>
                    </CardHeader>
                    <div className="h-[260px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={packageData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    dataKey="value"
                                    nameKey="name"
                                    strokeWidth={0}
                                >
                                    {packageData.map((_, i) => (
                                        <Cell key={i} fill={PACKAGE_COLORS[i % PACKAGE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => `${v} leads`} contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                                <Legend
                                    iconType="circle"
                                    iconSize={10}
                                    wrapperStyle={{ color: "#a1a1aa", fontSize: "13px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
