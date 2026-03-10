import { useQuery } from "@tanstack/react-query";
import { getAdminQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
} from "recharts";
import { DollarSign, TrendingUp, Target, Loader2 } from "lucide-react";

interface Stats {
    confirmedRevenue: number;
    pipelineRevenue: number;
    avgDealSize: number;
    monthlyRevenue: { month: string; confirmed: number; pipeline: number; total: number }[];
    forecast: { month: string; projected: number }[];
    byPackage: Record<string, number>;
}

const PACKAGE_PRICE: Record<string, number> = {
    Practice: 250,
    Executive: 450,
    "All Day": 800,
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl">
            <p className="text-zinc-300 font-semibold mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-6">
                    <span>{p.name}:</span>
                    <span className="font-bold">${p.value?.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
};

export default function SalesPage() {
    const { data: stats, isLoading } = useQuery<Stats>({
        queryKey: ["/api/admin/stats"],
        queryFn: getAdminQueryFn(),
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
    );

    const kpis = [
        {
            label: "Confirmed Revenue",
            value: `$${(stats?.confirmedRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            sub: "From confirmed + completed bookings",
        },
        {
            label: "Pipeline Revenue",
            value: `$${(stats?.pipelineRevenue || 0).toLocaleString()}`,
            icon: Target,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            sub: "From new + contacted leads",
        },
        {
            label: "Avg. Deal Size",
            value: `$${(stats?.avgDealSize || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            sub: "Average package value",
        },
    ];

    // Combine historical revenue with forecast for one continuous chart
    const forecastCombined = [
        ...(stats?.monthlyRevenue || []).map((m) => ({ month: m.month, actual: m.confirmed + m.pipeline, projected: undefined })),
        ...(stats?.forecast || []).map((f) => ({ month: f.month, actual: undefined, projected: f.projected })),
    ];

    const packageRevenue = Object.entries(stats?.byPackage || {}).map(([name, count]) => ({
        name,
        count,
        revenue: (PACKAGE_PRICE[name] || 0) * count,
    }));

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Sales</h2>
                <p className="text-zinc-400 mt-1">Revenue performance and 3-month outlook</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-zinc-400">{kpi.label}</CardTitle>
                                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{kpi.value}</div>
                            <p className="text-xs text-zinc-500 mt-1">{kpi.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue + Forecast Chart */}
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-white">Revenue History + 3-Month Forecast</CardTitle>
                    <p className="text-sm text-zinc-500">Actual revenue combined with projected growth</p>
                </CardHeader>
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastCombined}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: "12px" }} />
                            <ReferenceLine x={stats?.monthlyRevenue?.at(-1)?.month} stroke="#52525b" strokeDasharray="4 2" label={{ value: "Forecast →", fill: "#71717a", fontSize: 11 }} />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                dot={{ fill: "#22c55e", r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Actual Revenue"
                                connectNulls={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="projected"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                strokeDasharray="6 3"
                                dot={{ fill: "#3b82f6", r: 4 }}
                                name="Projected Revenue"
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Monthly Breakdown + Package Revenue side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-white">Monthly Breakdown</CardTitle>
                        <p className="text-sm text-zinc-500">Confirmed vs. pipeline by month</p>
                    </CardHeader>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.monthlyRevenue || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: "12px" }} />
                                <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="pipeline" name="Pipeline" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-white">Revenue by Package</CardTitle>
                        <p className="text-sm text-zinc-500">Total potential value per tier</p>
                    </CardHeader>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={packageRevenue} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                                    {packageRevenue.map((_, i) => (
                                        <Cell key={i} fill={["#22c55e", "#a855f7", "#f59e0b"][i % 3]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
