import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAdminQueryFn, adminApiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Plus, Trash2, DollarSign, TrendingDown, Loader2, Receipt, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type ExpenseCategory = "Equipment" | "Marketing" | "Travel" | "Maintenance" | "Staff" | "Supplies" | "Other";
type ExpenseStatus = "pending" | "paid" | "cancelled";

interface Expense {
    id: string;
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    status: ExpenseStatus;
    notes: string;
    createdAt: string;
}

const CATEGORIES: ExpenseCategory[] = ["Equipment", "Marketing", "Travel", "Maintenance", "Staff", "Supplies", "Other"];
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    Equipment: "#7c3aed", Marketing: "#3b82f6", Travel: "#f59e0b",
    Maintenance: "#8b5cf6", Staff: "#ec4899", Supplies: "#06b6d4", Other: "#71717a",
};

const STATUS_STYLES: Record<ExpenseStatus, { label: string; class: string; icon: any }> = {
    paid: { label: "Paid", class: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
    pending: { label: "Pending", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
    cancelled: { label: "Cancelled", class: "bg-zinc-500/10 text-zinc-500 border-zinc-700", icon: XCircle },
};

const EMPTY_FORM = { date: new Date().toISOString().split("T")[0], category: "Equipment" as ExpenseCategory, description: "", amount: "" as any, status: "pending" as ExpenseStatus, notes: "" };

export default function ExpensesPage() {
    const [open, setOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Expense | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [statusFilter, setStatusFilter] = useState("all");
    const { toast } = useToast();

    const { data: expenses = [], isLoading } = useQuery<Expense[]>({
        queryKey: ["/api/admin/expenses"],
        queryFn: getAdminQueryFn(),
    });

    const createMutation = useMutation({
        mutationFn: () => adminApiRequest("POST", "/api/admin/expenses", { ...form, amount: parseFloat(form.amount) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
            toast({ title: "Expense added" });
            setOpen(false); setForm(EMPTY_FORM);
        },
        onError: () => toast({ variant: "destructive", title: "Failed to add expense" }),
    });

    const updateMutation = useMutation({
        mutationFn: (id: string) => adminApiRequest("PATCH", `/api/admin/expenses/${id}`, { ...form, amount: parseFloat(form.amount) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
            toast({ title: "Expense updated" });
            setEditTarget(null); setOpen(false); setForm(EMPTY_FORM);
        },
        onError: () => toast({ variant: "destructive", title: "Failed to update" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApiRequest("DELETE", `/api/admin/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
            toast({ title: "Expense deleted" }); setDeleteTarget(null);
        },
    });

    const openEdit = (e: Expense) => {
        setEditTarget(e);
        setForm({ date: e.date, category: e.category, description: e.description, amount: e.amount as any, status: e.status, notes: e.notes });
        setOpen(true);
    };

    const filtered = expenses.filter(e => statusFilter === "all" || e.status === statusFilter);
    const totalPaid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
    const totalPending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);
    const totalAll = expenses.reduce((s, e) => s + (e.status !== "cancelled" ? e.amount : 0), 0);

    // Pie chart data by category
    const categoryData = CATEGORIES.map(cat => ({
        name: cat,
        value: expenses.filter(e => e.category === cat && e.status !== "cancelled").reduce((s, e) => s + e.amount, 0),
    })).filter(d => d.value > 0);

    // Monthly bar chart
    const monthlyMap: Record<string, number> = {};
    expenses.filter(e => e.status !== "cancelled").forEach(e => {
        const mon = format(new Date(e.date), "MMM");
        monthlyMap[mon] = (monthlyMap[mon] || 0) + e.amount;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

    if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Expenses</h2>
                    <p className="text-zinc-400 mt-1">Track all business costs in one place</p>
                </div>
                <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditTarget(null); setForm(EMPTY_FORM); } else setOpen(true); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white gap-2 font-bold">
                            <Plus className="w-4 h-4" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-violet-500/20 text-white sm:max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>{editTarget ? "Edit Expense" : "Add Expense"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Date</label>
                                    <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Amount ($)</label>
                                    <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            </div>
                            <div className="space-y-1"><label className="text-xs text-zinc-400">Description</label>
                                <Input placeholder="What was this expense for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Category</label>
                                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select></div>
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Status</label>
                                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ExpenseStatus }))}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {Object.keys(STATUS_STYLES).map(s => <SelectItem key={s} value={s}>{STATUS_STYLES[s as ExpenseStatus].label}</SelectItem>)}
                                        </SelectContent>
                                    </Select></div>
                            </div>
                            <div className="space-y-1"><label className="text-xs text-zinc-400">Notes (optional)</label>
                                <Input placeholder="Any additional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            <Button
                                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold mt-2"
                                onClick={() => editTarget ? updateMutation.mutate(editTarget.id) : createMutation.mutate()}
                                disabled={!form.description || !form.amount || createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editTarget ? "Save Changes" : "Add Expense"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: "Total Spent", value: `$${totalAll.toLocaleString()}`, icon: DollarSign, color: "text-red-400", bg: "bg-red-500/10" },
                    { label: "Paid", value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Pending", value: `$${totalPending.toLocaleString()}`, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                ].map(kpi => (
                    <Card key={kpi.label} className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs text-zinc-400 uppercase tracking-wider">{kpi.label}</CardTitle>
                            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-white">{kpi.value}</div></CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts row */}
            {expenses.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <CardTitle className="text-white text-base mb-4">Spend by Category</CardTitle>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {categoryData.map(d => <Cell key={d.name} fill={CATEGORY_COLORS[d.name as ExpenseCategory]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <CardTitle className="text-white text-base mb-4">Monthly Spend</CardTitle>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Spent"]} contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                                    <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filter + Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    {["all", "pending", "paid", "cancelled"].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? "bg-violet-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                    <span className="ml-auto text-sm text-zinc-500">{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Description</TableHead>
                                <TableHead className="text-zinc-400">Category</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                <TableHead className="text-right text-zinc-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center text-zinc-500 py-12">No expenses yet — add your first one above!</TableCell></TableRow>
                            ) : filtered.map(expense => {
                                const st = STATUS_STYLES[expense.status];
                                return (
                                    <TableRow key={expense.id} onClick={() => openEdit(expense)} className="border-zinc-900 hover:bg-zinc-900/50 cursor-pointer">
                                        <TableCell className="text-zinc-500 text-sm">{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            <p className="text-white font-medium">{expense.description}</p>
                                            {expense.notes && <p className="text-zinc-600 text-xs mt-0.5">{expense.notes}</p>}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: CATEGORY_COLORS[expense.category] + "20", color: CATEGORY_COLORS[expense.category] }}>
                                                {expense.category}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`border text-xs ${st.class}`}>{st.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-white">${expense.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setDeleteTarget(expense); }}
                                                className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Delete "<strong className="text-white">{deleteTarget?.description}</strong>" (${deleteTarget?.amount})?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
