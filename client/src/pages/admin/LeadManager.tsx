import { useQuery, useMutation } from "@tanstack/react-query";
import { getAdminQueryFn, adminApiRequest, queryClient } from "@/lib/queryClient";
import { type Booking } from "@shared/schema";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Search, MoreHorizontal, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function LeadManager() {
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const { data: leads, isLoading } = useQuery<Booking[]>({
        queryKey: ["/api/bookings"],
        queryFn: getAdminQueryFn(),
    });

    const mutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Booking> }) => {
            await adminApiRequest("PATCH", `/api/bookings/${id}`, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            toast({ title: "Lead Updated", description: "Changes have been saved successfully." });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Update Failed", description: "Something went wrong." });
        }
    });

    const filteredLeads = leads?.filter(lead =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
            contacted: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
            confirmed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
            completed: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20",
            cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        };
        return <Badge className={styles[status] || styles.new}>{status.toUpperCase()}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Lead Management</h2>
                    <p className="text-zinc-400 mt-2">Track and manage every booking request</p>
                </div>

                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                    />
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/50">
                        <TableRow className="border-zinc-800">
                            <TableHead className="text-zinc-400">Date Received</TableHead>
                            <TableHead className="text-zinc-400">Client</TableHead>
                            <TableHead className="text-zinc-400">Package</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads?.map((lead) => (
                            <TableRow key={lead.id} className="border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                <TableCell className="text-zinc-500 text-sm">
                                    {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">{lead.firstName} {lead.lastName}</span>
                                        <span className="text-zinc-500 text-xs flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3" /> {lead.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-300 font-medium">
                                    {lead.package}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(lead.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
                                            <LeadDetailModal lead={lead} onSave={(updates) => mutation.mutate({ id: lead.id, updates })} isUpdating={mutation.isPending} />
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function LeadDetailModal({ lead, onSave, isUpdating }: { lead: Booking, onSave: (u: Partial<Booking>) => void, isUpdating: boolean }) {
    const [status, setStatus] = useState(lead.status);
    const [notes, setNotes] = useState(lead.internalNotes || "");

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {lead.firstName} {lead.lastName}
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">{lead.package}</Badge>
                </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                <div className="space-y-1">
                    <p className="text-zinc-500">Contact</p>
                    <p className="text-white flex items-center gap-2"><Mail className="w-4 h-4 text-zinc-500" /> {lead.email}</p>
                    <p className="text-white flex items-center gap-2"><Phone className="w-4 h-4 text-zinc-500" /> {lead.phone}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-zinc-500">Event Details</p>
                    <p className="text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-500" /> {lead.eventDate} @ {lead.startTime}</p>
                    <p className="text-zinc-400 italic">"{lead.message || 'No message'}"</p>
                </div>
            </div>

            <div className="space-y-4 py-4 border-t border-zinc-800">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Current Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="new">NEW</SelectItem>
                            <SelectItem value="contacted">CONTACTED</SelectItem>
                            <SelectItem value="confirmed">CONFIRMED</SelectItem>
                            <SelectItem value="completed">COMPLETED</SelectItem>
                            <SelectItem value="cancelled">CANCELLED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Internal Business Notes</label>
                    <Textarea
                        placeholder="Add notes about event details, payments, etc..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white h-32"
                    />
                </div>

                <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    onClick={() => onSave({ status, internalNotes: notes })}
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Update Recording
                </Button>
            </div>
        </>
    );
}
