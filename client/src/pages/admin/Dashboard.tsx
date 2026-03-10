import { useQuery } from "@tanstack/react-query";
import { getAdminQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, TrendingUp, Calendar, CheckCircle2, Loader2 } from "lucide-react";

interface Stats {
    totalLeads: number;
    newLeads: number;
    byPackage: Record<string, number>;
    revenuePotential: number;
}

export default function Dashboard() {
    const { data: stats, isLoading } = useQuery<Stats>({
        queryKey: ["/api/admin/stats"],
        queryFn: getAdminQueryFn(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    const kpis = [
        { label: "Total Leads", value: stats?.totalLeads || 0, icon: Users, color: "text-blue-500" },
        { label: "New Requests", value: stats?.newLeads || 0, icon: Calendar, color: "text-yellow-500" },
        { label: "Revenue Potential", value: `$${(stats?.revenuePotential || 0).toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
        { label: "Conversion Rate", value: "24%", icon: CheckCircle2, color: "text-purple-500" },
    ];

    const chartData = Object.entries(stats?.byPackage || {}).map(([name, value]) => ({
        name: name.replace(" Package", ""),
        value
    }));

    const COLORS = ["#22c55e", "#3b82f6", "#a855f7"];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Business Overview</h2>
                <p className="text-zinc-400 mt-2">Real-time performance metrics for One More Swing</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">{kpi.label}</CardTitle>
                            <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <CardHeader className="px-0">
                        <CardTitle className="text-white">Leads by Package</CardTitle>
                    </CardHeader>
                    <div className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "#27272a" }}
                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 p-6 flex flex-col justify-center text-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-2">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Ready for Growth</h3>
                        <p className="text-zinc-400 max-w-sm mx-auto">
                            You have {stats?.newLeads} uncontacted leads. Reach out to them to secure more bookings and hit your targets.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Helper to avoid import error if cn isn't imported
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
