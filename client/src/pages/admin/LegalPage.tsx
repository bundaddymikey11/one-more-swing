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
import { Plus, Trash2, FileText, ShieldCheck, Clock, AlertTriangle, Edit2, Loader2 } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import FileUpload, { AttachmentPreview } from "@/components/admin/FileUpload";

type LegalStatus = "active" | "pending" | "expired" | "draft";

interface LegalDoc {
    id: string;
    title: string;
    type: string;
    clientName: string;
    dateCreated: string;
    expiryDate: string;
    status: LegalStatus;
    notes: string;
    createdAt: string;
}

const DOC_TYPES = ["Client Contract", "Liability Waiver", "NDA", "Service Agreement", "Insurance Policy", "Permit", "Partnership Agreement", "Other"];

const STATUS_STYLES: Record<LegalStatus, { label: string; class: string; icon: any }> = {
    active: { label: "Active", class: "bg-green-500/10 text-green-400 border-green-500/20", icon: ShieldCheck },
    pending: { label: "Pending", class: "bg-[#FDB927]/10 text-[#FDB927] border-yellow-500/20", icon: Clock },
    expired: { label: "Expired", class: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertTriangle },
    draft: { label: "Draft", class: "bg-zinc-500/10 text-zinc-400 border-zinc-700", icon: FileText },
};

const EMPTY_FORM = { title: "", type: "Client Contract", clientName: "", dateCreated: new Date().toISOString().split("T")[0], expiryDate: "", status: "draft" as LegalStatus, notes: "" };

export default function LegalPage() {
    const [open, setOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<LegalDoc | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LegalDoc | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [statusFilter, setStatusFilter] = useState("all");
    const [attachments, setAttachments] = useState<{ url: string; name: string; type: "image" | "pdf" }[]>([]);
    const { toast } = useToast();

    const { data: docs = [], isLoading } = useQuery<LegalDoc[]>({
        queryKey: ["/api/admin/legal"],
        queryFn: getAdminQueryFn(),
    });

    const createMutation = useMutation({
        mutationFn: () => adminApiRequest("POST", "/api/admin/legal", form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/legal"] });
            toast({ title: "Document added" }); setOpen(false); setForm(EMPTY_FORM);
        },
        onError: () => toast({ variant: "destructive", title: "Failed to add document" }),
    });

    const updateMutation = useMutation({
        mutationFn: (id: string) => adminApiRequest("PATCH", `/api/admin/legal/${id}`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/legal"] });
            toast({ title: "Document updated" }); setEditTarget(null); setOpen(false); setForm(EMPTY_FORM);
        },
        onError: () => toast({ variant: "destructive", title: "Failed to update" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApiRequest("DELETE", `/api/admin/legal/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/legal"] });
            toast({ title: "Document removed" }); setDeleteTarget(null);
        },
    });

    const openEdit = (d: LegalDoc) => {
        setEditTarget(d);
        setForm({ title: d.title, type: d.type, clientName: d.clientName, dateCreated: d.dateCreated, expiryDate: d.expiryDate, status: d.status, notes: d.notes });
        setOpen(true);
    };

    const filtered = docs.filter(d => statusFilter === "all" || d.status === statusFilter);

    const counts = { active: docs.filter(d => d.status === "active").length, pending: docs.filter(d => d.status === "pending").length, expired: docs.filter(d => d.status === "expired").length, draft: docs.filter(d => d.status === "draft").length };

    // Expiring soon: active docs expiring within 30 days
    const expiringSoon = docs.filter(d => d.status === "active" && d.expiryDate && differenceInDays(new Date(d.expiryDate), new Date()) <= 30 && !isPast(new Date(d.expiryDate)));

    if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Legal & Contracts</h2>
                    <p className="text-zinc-400 mt-1">Manage all business documents, waivers, and agreements</p>
                </div>
                <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditTarget(null); setForm(EMPTY_FORM); } else setOpen(true); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white gap-2 font-bold">
                            <Plus className="w-4 h-4" /> Add Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-[#552583]/30 text-white sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>{editTarget ? "Edit Document" : "Add Legal Document"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="space-y-1"><label className="text-xs text-zinc-400">Document Title</label>
                                <Input placeholder="e.g. Smith Wedding Liability Waiver" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Type</label>
                                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select></div>
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Status</label>
                                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as LegalStatus }))}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {(Object.keys(STATUS_STYLES) as LegalStatus[]).map(s => <SelectItem key={s} value={s}>{STATUS_STYLES[s].label}</SelectItem>)}
                                        </SelectContent>
                                    </Select></div>
                            </div>
                            <div className="space-y-1"><label className="text-xs text-zinc-400">Client / Party Name</label>
                                <Input placeholder="Client or organization name" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Date Created</label>
                                    <Input type="date" value={form.dateCreated} onChange={e => setForm(f => ({ ...f, dateCreated: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                                <div className="space-y-1"><label className="text-xs text-zinc-400">Expiry Date</label>
                                    <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            </div>
                            <div className="space-y-1"><label className="text-xs text-zinc-400">Notes</label>
                                <Input placeholder="Any important notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-white" /></div>
                            {/* File attachment */}
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-400 uppercase tracking-wider">Attach Document / Photo</label>
                                {attachments.map((a, i) => (
                                    <AttachmentPreview key={i} {...a} onRemove={() => setAttachments(prev => prev.filter((_, j) => j !== i))} />
                                ))}
                                <FileUpload label="Take photo or upload PDF" onUploaded={(f) => setAttachments(prev => [...prev, f])} />
                            </div>
                            <Button
                                className="w-full bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold mt-2"
                                onClick={() => editTarget ? updateMutation.mutate(editTarget.id) : createMutation.mutate()}
                                disabled={!form.title || createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editTarget ? "Save Changes" : "Add Document"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Status summary cards */}
            <div className="grid grid-cols-4 gap-4">
                {([["active", "Active", "text-green-500", "bg-green-500/10", ShieldCheck], ["pending", "Pending Review", "text-[#FDB927]", "bg-[#FDB927]/10", Clock], ["expired", "Expired", "text-red-400", "bg-red-500/10", AlertTriangle], ["draft", "Drafts", "text-zinc-400", "bg-zinc-800", FileText]] as const).map(([key, label, color, bg, Icon]) => (
                    <Card key={key} onClick={() => setStatusFilter(statusFilter === key ? "all" : key)} className={`bg-zinc-900 border-zinc-800 cursor-pointer transition-all ${statusFilter === key ? "border-green-500/30" : "hover:border-zinc-700"}`}>
                        <CardContent className="pt-5 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-4 h-4 ${color}`} /></div>
                            <div><p className="text-2xl font-bold text-white">{counts[key]}</p><p className="text-xs text-zinc-500">{label}</p></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Expiring soon alert */}
            {expiringSoon.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-400 font-semibold text-sm">⚠️ {expiringSoon.length} document{expiringSoon.length > 1 ? "s" : ""} expiring within 30 days</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {expiringSoon.map(d => (
                                <span key={d.id} className="text-xs bg-amber-500/10 text-amber-300 px-2 py-1 rounded-md border border-amber-500/20">
                                    {d.title} — expires {format(new Date(d.expiryDate), "MMM d")}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Documents table */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === "all" ? "bg-[#552583] text-white" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}>All</button>
                    {(Object.keys(STATUS_STYLES) as LegalStatus[]).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? "bg-[#552583] text-white" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}>{STATUS_STYLES[s].label}</button>
                    ))}
                    <span className="ml-auto text-sm text-zinc-500">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Document</TableHead>
                                <TableHead className="text-zinc-400">Client / Party</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400">Expires</TableHead>
                                <TableHead className="text-right text-zinc-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-zinc-500 py-12">No documents yet — add your first one above!</TableCell></TableRow>
                            ) : filtered.map(doc => {
                                const st = STATUS_STYLES[doc.status];
                                const daysLeft = doc.expiryDate ? differenceInDays(new Date(doc.expiryDate), new Date()) : null;
                                return (
                                    <TableRow key={doc.id} className="border-zinc-900 hover:bg-zinc-900/50 cursor-pointer" onClick={() => openEdit(doc)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><FileText className="w-4 h-4 text-zinc-500" /></div>
                                                <div>
                                                    <p className="text-white font-medium">{doc.title}</p>
                                                    <p className="text-zinc-500 text-xs">{doc.type}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">{doc.clientName || <span className="text-zinc-600 italic">—</span>}</TableCell>
                                        <TableCell>
                                            <Badge className={`border text-xs gap-1 ${st.class}`}>
                                                <st.icon className="w-3 h-3" />{st.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {doc.expiryDate ? (
                                                <div>
                                                    <p className={`text-sm ${daysLeft !== null && daysLeft <= 30 && daysLeft >= 0 ? "text-amber-400 font-medium" : "text-zinc-400"}`}>
                                                        {format(new Date(doc.expiryDate), "MMM d, yyyy")}
                                                    </p>
                                                    {daysLeft !== null && daysLeft >= 0 && <p className="text-xs text-zinc-600">{daysLeft}d left</p>}
                                                    {daysLeft !== null && daysLeft < 0 && <p className="text-xs text-red-400">Expired</p>}
                                                </div>
                                            ) : <span className="text-zinc-600 text-sm italic">No expiry</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); openEdit(doc); }} className="text-zinc-600 hover:text-white hover:bg-zinc-800"><Edit2 className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setDeleteTarget(doc); }} className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
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
                        <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">Remove "<strong className="text-white">{deleteTarget?.title}</strong>" permanently?</AlertDialogDescription>
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
