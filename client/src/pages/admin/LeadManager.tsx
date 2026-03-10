import { useQuery, useMutation } from "@tanstack/react-query";
import { getAdminQueryFn, adminApiRequest, queryClient } from "@/lib/queryClient";
import { type Booking } from "@shared/schema";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search, MoreHorizontal, Mail, Phone, Calendar, Loader2,
    ArrowUpDown, ChevronLeft, ChevronRight, Download, X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import FileUpload, { AttachmentPreview } from "@/components/admin/FileUpload";

type SortKey = "createdAt" | "firstName" | "package" | "status";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
    new: "bg-[#FDB927]/10 text-[#FDB927] border-yellow-500/20",
    contacted: "bg-[#552583]/10 text-[#FDB927] border-[#552583]/30",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
    completed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAGE_SIZE = 10;

export default function LeadManager() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");
    const [sortKey, setSortKey] = useState<SortKey>("createdAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [page, setPage] = useState(1);
    const { toast } = useToast();

    const { data: leads = [], isLoading } = useQuery<Booking[]>({
        queryKey: ["/api/bookings"],
        queryFn: getAdminQueryFn(),
    });

    const mutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Booking> }) => {
            await adminApiRequest("PATCH", `/api/bookings/${id}`, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "Lead Updated", description: "Changes saved successfully." });
        },
        onError: () => toast({ variant: "destructive", title: "Update Failed" }),
    });

    const filtered = useMemo(() => {
        let result = [...leads];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (l) => `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") result = result.filter((l) => l.status === statusFilter);
        if (packageFilter !== "all") result = result.filter((l) => l.package.toLowerCase().includes(packageFilter.toLowerCase()));

        result.sort((a, b) => {
            let av = a[sortKey] ?? "";
            let bv = b[sortKey] ?? "";
            if (sortDir === "asc") return av < bv ? -1 : av > bv ? 1 : 0;
            return av > bv ? -1 : av < bv ? 1 : 0;
        });
        return result;
    }, [leads, search, statusFilter, packageFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
        setPage(1);
    };

    const exportCSV = () => {
        const headers = ["Name", "Email", "Phone", "Package", "Date", "Event Date", "Status"];
        const rows = filtered.map((l) => [
            `${l.firstName} ${l.lastName}`, l.email, l.phone, l.package,
            format(new Date(l.createdAt), "yyyy-MM-dd"), l.eventDate, l.status,
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Leads</h2>
                    <p className="text-zinc-400 mt-1">{filtered.length} of {leads.length} total leads</p>
                </div>
                <Button onClick={exportCSV} variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={packageFilter} onValueChange={(v) => { setPackageFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-white">
                        <SelectValue placeholder="Package" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="all">All Packages</SelectItem>
                        <SelectItem value="Practice">Practice</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="All Day">All Day</SelectItem>
                    </SelectContent>
                </Select>
                {(search || statusFilter !== "all" || packageFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setPackageFilter("all"); setPage(1); }}
                        className="text-zinc-400 hover:text-white gap-1">
                        <X className="w-3 h-3" /> Clear
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/50">
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            {[
                                { key: "createdAt", label: "Date" },
                                { key: "firstName", label: "Client" },
                                { key: "package", label: "Package" },
                                { key: "status", label: "Status" },
                            ].map(({ key, label }) => (
                                <TableHead key={key}
                                    className="text-zinc-400 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => toggleSort(key as SortKey)}>
                                    <div className="flex items-center gap-1">
                                        {label}
                                        <ArrowUpDown className={`w-3 h-3 ${sortKey === key ? "text-[#FDB927]" : "text-zinc-600"}`} />
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-zinc-500 py-16">
                                    No leads match your filters.
                                </TableCell>
                            </TableRow>
                        ) : paginated.map((lead) => (
                            <TableRow key={lead.id} className="border-zinc-900 hover:bg-zinc-900/30">
                                <TableCell className="text-zinc-500 text-sm">
                                    {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-white font-medium">{lead.firstName} {lead.lastName}</p>
                                        <p className="text-zinc-500 text-xs flex items-center gap-1">
                                            <Mail className="w-3 h-3" />{lead.email}
                                        </p>
                                        <p className="text-zinc-600 text-xs flex items-center gap-1">
                                            <Phone className="w-3 h-3" />{lead.phone}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-zinc-200 font-medium text-sm">{lead.package}</p>
                                        <p className="text-zinc-500 text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />{lead.eventDate}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`text-xs border ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                                        {lead.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-900 border-[#552583]/30 text-white sm:max-w-[520px] shadow-2xl shadow-black/50">
                                            <LeadModal lead={lead} onSave={(u) => mutation.mutate({ id: lead.id, updates: u })} isLoading={mutation.isPending} />
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                        className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 gap-1">
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 gap-1">
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function LeadModal({ lead, onSave, isLoading }: { lead: Booking; onSave: (u: Partial<Booking>) => void; isLoading: boolean }) {
    const [status, setStatus] = useState(lead.status);
    const [notes, setNotes] = useState(lead.internalNotes || "");
    const [attachments, setAttachments] = useState<{ url: string; name: string; type: "image" | "pdf" }[]>([]);
    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-yellow-400 bg-clip-text text-transparent">
                    {lead.firstName} {lead.lastName}
                </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 text-sm border-b border-zinc-800">
                <div className="space-y-2 text-zinc-300">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-500" />{lead.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-500" />{lead.phone}</p>
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-500" />{lead.eventDate} @ {lead.startTime}</p>
                </div>
                <div className="text-zinc-300 space-y-2 text-sm">
                    <p><span className="text-zinc-500">Package:</span> {lead.package}</p>
                    <p><span className="text-zinc-500">Length:</span> {lead.eventLength}</p>
                    <p><span className="text-zinc-500">Location:</span> {lead.location}</p>
                </div>
            </div>
            {lead.message && <p className="text-zinc-400 text-sm py-2 italic">"{lead.message}"</p>}
            <div className="space-y-4 pt-2">
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {["new", "contacted", "confirmed", "completed", "cancelled"].map((s) => (
                            <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Textarea
                    placeholder="Internal notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white h-24"
                />
                {/* Attachments */}
                <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Attachments</p>
                    {attachments.map((a, i) => (
                        <AttachmentPreview key={i} {...a} onRemove={() => setAttachments(prev => prev.filter((_, j) => j !== i))} />
                    ))}
                    <FileUpload label="Attach photo or PDF" onUploaded={(f) => setAttachments(prev => [...prev, f])} />
                </div>
                <Button
                    className="w-full bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold shadow-lg shadow-[#552583]/20"
                    onClick={() => onSave({ status, internalNotes: notes })}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                </Button>
            </div>
        </>
    );
}
