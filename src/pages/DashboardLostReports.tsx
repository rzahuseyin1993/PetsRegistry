import DashboardSidebar from "@/components/DashboardSidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, AlertTriangle, EyeOff, Eye } from "lucide-react";

const DashboardLostReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editReport, setEditReport] = useState<any>(null);

  const { data: reports = [] } = useQuery({
    queryKey: ["my-lost-reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lost_reports")
        .select("*, pets(id, name, species, breed, pet_code)")
        .eq("reporter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    const { error } = await supabase.from("lost_reports").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Report deleted"); queryClient.invalidateQueries({ queryKey: ["my-lost-reports"] }); }
  };

  const handleSave = async () => {
    if (!editReport) return;
    const { error } = await supabase.from("lost_reports").update({
      description: editReport.description,
      last_seen_address: editReport.last_seen_address,
      contact_phone: editReport.contact_phone,
      reward: editReport.reward,
      status: editReport.status,
    }).eq("id", editReport.id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Report updated");
    setEditReport(null);
    queryClient.invalidateQueries({ queryKey: ["my-lost-reports"] });
  };

  const statusColors: Record<string, string> = {
    active: "bg-destructive/10 text-destructive",
    found: "bg-emerald-100 text-emerald-700",
    resolved: "bg-blue-100 text-blue-700",
    closed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <div className="flex items-center gap-2 md:hidden">
            <MobileSidebar />
          </div>
          <AlertTriangle className="h-6 w-6 text-destructive" /> My Lost Reports
        </h1>
        <p className="text-sm text-muted-foreground">Edit details, change status (active/found/resolved), or delete reports.</p>

        <Card className="mt-8">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No lost reports yet.</TableCell></TableRow>
                ) : reports.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <span className="font-medium">{report.pets?.name}</span>
                      <span className="ml-2 text-xs font-mono text-muted-foreground">{report.pets?.pet_code}</span>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{report.last_seen_address || "—"}</TableCell>
                    <TableCell className="text-sm">{report.contact_phone || "—"}</TableCell>
                    <TableCell className="text-sm">{report.reward || "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[report.status] || "bg-muted text-muted-foreground"}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditReport({ ...report })}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(report.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!editReport} onOpenChange={(o) => !o && setEditReport(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Lost Report</DialogTitle></DialogHeader>
            {editReport && (
              <div className="space-y-4 pt-2">
                <div><Label>Description</Label><Textarea value={editReport.description || ""} onChange={(e) => setEditReport({ ...editReport, description: e.target.value })} rows={4} /></div>
                <div><Label>Last Seen Address</Label><Input value={editReport.last_seen_address || ""} onChange={(e) => setEditReport({ ...editReport, last_seen_address: e.target.value })} /></div>
                <div><Label>Contact Phone</Label><Input value={editReport.contact_phone || ""} onChange={(e) => setEditReport({ ...editReport, contact_phone: e.target.value })} /></div>
                <div><Label>Reward</Label><Input value={editReport.reward || ""} onChange={(e) => setEditReport({ ...editReport, reward: e.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editReport.status} onChange={(e) => setEditReport({ ...editReport, status: e.target.value })}>
                    <option value="active">Active (Still Lost)</option>
                    <option value="found">Found</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <Button className="w-full" onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DashboardLostReports;
