import { useQuery, useMutation } from "@tanstack/react-query";
import { getAdminQueryFn, adminApiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserPlus, Trash2, Shield, Eye, Loader2, Mail, CalendarDays } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "viewer";
    createdAt: string;
}

const ROLE_STYLES = {
    admin: "bg-[#552583]/10 text-[#FDB927] border-[#552583]/30",
    viewer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function UsersPage() {
    const [open, setOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "viewer" as "admin" | "viewer" });
    const { toast } = useToast();

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
        queryFn: getAdminQueryFn(),
    });

    const createMutation = useMutation({
        mutationFn: () => adminApiRequest("POST", "/api/admin/users", form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User Created", description: `${form.name} now has ${form.role} access.` });
            setOpen(false);
            setForm({ name: "", email: "", password: "", role: "viewer" });
        },
        onError: () => toast({ variant: "destructive", title: "Failed to create user" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApiRequest("DELETE", `/api/admin/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User Removed", description: "Access has been revoked." });
            setDeleteTarget(null);
        },
        onError: (e: any) => toast({ variant: "destructive", title: "Cannot remove", description: "Cannot delete the master admin." }),
    });

    const currentUserRole = localStorage.getItem("admin_role");

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Team Members</h2>
                    <p className="text-zinc-400 mt-1">Manage who has access to the Command Center</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white gap-2 font-bold">
                            <UserPlus className="w-4 h-4" /> Add Team Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-[#552583]/30 text-white sm:max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-1.5">
                                <label className="text-sm text-zinc-400">Full Name</label>
                                <Input
                                    placeholder="Jane Smith"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm text-zinc-400">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="jane@onemoreswing.golf"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm text-zinc-400">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Set a strong password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm text-zinc-400">Access Role</label>
                                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as any }))}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-green-500" />
                                                <div>
                                                    <p className="font-medium">Admin</p>
                                                    <p className="text-xs text-zinc-500">Full access — view, edit, manage team</p>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="viewer">
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-blue-400" />
                                                <div>
                                                    <p className="font-medium">Viewer</p>
                                                    <p className="text-xs text-zinc-500">Read-only — dashboard + leads view only</p>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Role explanation */}
                            <div className={`p-3 rounded-lg border text-xs ${form.role === 'admin' ? 'bg-[#552583]/5 border-[#552583]/30 text-[#FDB927]' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'}`}>
                                {form.role === 'admin'
                                    ? '✅ Can view all tabs, edit leads, manage users, and access all data.'
                                    : '👁️ Can view Overview and Leads (read-only). Cannot edit statuses or access Sales, Marketing, or Users.'}
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-[#552583] to-[#3d1a63] hover:from-[#6b2fa0] hover:to-[#552583] text-white font-bold mt-2"
                                onClick={() => createMutation.mutate()}
                                disabled={!form.name || !form.email || !form.password || createMutation.isPending}
                            >
                                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Account
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Role overview cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#552583]/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === "admin").length}</p>
                            <p className="text-sm text-zinc-500">Admin Users</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{users.filter(u => u.role === "viewer").length}</p>
                            <p className="text-sm text-zinc-500">Viewer Users</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-900/50">
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-400">User</TableHead>
                            <TableHead className="text-zinc-400">Role</TableHead>
                            <TableHead className="text-zinc-400">Added</TableHead>
                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id} className="border-zinc-900 hover:bg-zinc-900/30">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">
                                            {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-zinc-500 text-xs flex items-center gap-1">
                                                <Mail className="w-3 h-3" />{user.email}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`border text-xs gap-1 ${ROLE_STYLES[user.role]}`}>
                                        {user.role === "admin" ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-500 text-sm">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="w-3 h-3" />
                                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {user.id !== "master" ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteTarget(user)}
                                            className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-zinc-600 pr-3">Master</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove User Access?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            This will permanently remove <strong className="text-white">{deleteTarget?.name}</strong>'s access to the Command Center. They will no longer be able to log in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove Access"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
