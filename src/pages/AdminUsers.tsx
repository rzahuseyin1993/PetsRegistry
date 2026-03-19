import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldAlert, Send, Eye, Search, Mail, Download } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";
import { exportToCsv } from "@/lib/exportCsv";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleBadgeMap: Record<AppRole, { label: string; className: string; icon: typeof Shield }> = {
  admin: { label: "Admin", className: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
  moderator: { label: "Moderator", className: "bg-warning/10 text-warning border-warning/20", icon: ShieldCheck },
  user: { label: "User", className: "bg-muted text-muted-foreground border-border", icon: Shield },
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Notification form
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifRecipient, setNotifRecipient] = useState<string>("");

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (deleteError) throw deleteError;
      const { error: insertError } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role updated successfully");
    },
    onError: (err: Error) => toast.error("Failed: " + err.message),
  });

  const sendNotification = useMutation({
    mutationFn: async () => {
      if (!notifTitle || !notifMessage) throw new Error("Title and message required");
      const targetUsers = notifRecipient === "all" 
        ? users.map(u => u.user_id) 
        : [notifRecipient];

      const rows = targetUsers.map(uid => ({
        user_id: uid,
        title: notifTitle,
        message: notifMessage,
        type: "admin_message",
      }));

      const { error } = await supabase.from("notifications").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notification sent!");
      setNotifTitle("");
      setNotifMessage("");
      setNotifRecipient("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getUserRole = (userId: string): AppRole => {
    const userRole = roles.find((r) => r.user_id === userId);
    return userRole?.role ?? "user";
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return !q || 
      u.email.toLowerCase().includes(q) || 
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q) ||
      ((u as any).country || "").toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Members Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} registered members</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToCsv("members", filteredUsers.map(u => ({
              name: u.full_name || "",
              email: u.email,
              phone: u.phone || "",
              address: (u as any).address || "",
              city: (u as any).city || "",
              country: (u as any).country || "",
              race: (u as any).race || "",
              role: getUserRole(u.user_id),
              joined: new Date(u.created_at).toLocaleDateString(),
            })), [
              { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" },
              { key: "address", label: "Address" }, { key: "city", label: "City" }, { key: "country", label: "Country" },
              { key: "race", label: "Race" }, { key: "role", label: "Role" }, { key: "joined", label: "Joined" },
            ])}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            {/* Send Notification Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Send className="h-4 w-4" /> Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Send Notification to Members
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Recipient</Label>
                    <Select value={notifRecipient} onValueChange={setNotifRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.full_name || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} placeholder="Write your message..." rows={4} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={() => sendNotification.mutate()} 
                    disabled={!notifTitle || !notifMessage || !notifRecipient || sendNotification.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sendNotification.isPending ? "Sending..." : "Send"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 flex max-w-sm items-center gap-2 rounded-lg border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, phone, country..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>

        <Card className="mt-6">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const currentRole = getUserRole(user.user_id);
                  const roleInfo = roleBadgeMap[currentRole];
                  const RoleIcon = roleInfo.icon;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                      <TableCell className="text-xs">{user.email}</TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>{(user as any).country || "—"}</TableCell>
                      <TableCell className="text-xs">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={currentRole}
                          onValueChange={(value: AppRole) => assignRole.mutate({ userId: user.user_id, role: value })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <div className="flex items-center gap-1.5">
                              <RoleIcon className="h-3 w-3" />
                              <span className="text-xs">{roleInfo.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4" /> View
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Member Details</SheetTitle>
                            </SheetHeader>
                            {selectedUser && (
                              <div className="mt-6 space-y-4">
                                <DetailRow label="Full Name" value={selectedUser.full_name} />
                                <DetailRow label="Email" value={selectedUser.email} />
                                <DetailRow label="Phone" value={selectedUser.phone} />
                                <DetailRow label="Address" value={(selectedUser as any).address} />
                                <DetailRow label="City" value={(selectedUser as any).city} />
                                <DetailRow label="Country" value={(selectedUser as any).country} />
                                <DetailRow label="Race" value={(selectedUser as any).race} />
                                <DetailRow label="Show Name" value={selectedUser.show_name ? "Yes" : "No"} />
                                <DetailRow label="Show Phone" value={selectedUser.show_phone ? "Yes" : "No"} />
                                <DetailRow label="Joined" value={new Date(selectedUser.created_at).toLocaleString()} />
                                <DetailRow label="User ID" value={selectedUser.user_id} mono />
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const DetailRow = ({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) => (
  <div className="border-b border-border pb-3">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
  </div>
);

export default AdminUsers;
