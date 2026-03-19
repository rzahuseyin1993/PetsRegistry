import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Pencil, Heart, Download, Trash2, EyeOff, Eye } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";

const statusColors: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-muted text-muted-foreground",
};

const AdminAdoptions = () => {
  const queryClient = useQueryClient();
  const [editListing, setEditListing] = useState<any>(null);

  const { data: listings = [] } = useQuery({
    queryKey: ["admin-adoptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_adoptions")
        .select("*, pets(id, name, species, breed, pet_code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = [...new Set([...data.map(d => d.owner_id), ...data.filter(d => d.adopter_id).map(d => d.adopter_id)])];
      const { data: profiles } = await supabase.from("profiles").select("user_id, email, full_name").in("user_id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
      return data.map(d => ({
        ...d,
        ownerEmail: profileMap[d.owner_id]?.email || "—",
        adopterEmail: d.adopter_id ? profileMap[d.adopter_id]?.email || "—" : null,
      }));
    },
  });

  const handleToggleVisibility = async (id: string, currentlyApproved: boolean) => {
    const { error } = await supabase.from("pet_adoptions").update({ admin_approved: !currentlyApproved }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(currentlyApproved ? "Listing hidden" : "Listing restored"); queryClient.invalidateQueries({ queryKey: ["admin-adoptions"] }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this adoption listing?")) return;
    const { error } = await supabase.from("pet_adoptions").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Listing deleted"); queryClient.invalidateQueries({ queryKey: ["admin-adoptions"] }); }
  };

  const handleSave = async () => {
    if (!editListing) return;
    const { error } = await supabase.from("pet_adoptions").update({
      description: editListing.description,
      adoption_fee: editListing.adoption_fee ? Number(editListing.adoption_fee) : 0,
      status: editListing.status,
      admin_approved: editListing.admin_approved,
    }).eq("id", editListing.id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Listing updated");
    setEditListing(null);
    queryClient.invalidateQueries({ queryKey: ["admin-adoptions"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500" /> Adoption Management
            </h1>
            <p className="text-sm text-muted-foreground">Full control: edit, hide, delete, and change status of all adoption listings.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => exportToCsv("adoptions", listings.map((a: any) => ({
            pet: a.pets?.name || "", species: a.pets?.species || "", status: a.status,
            fee: a.adoption_fee || 0, approved: a.admin_approved ? "Yes" : "No",
            owner: a.ownerEmail, adopter: a.adopterEmail || "",
            description: a.description || "",
            date: new Date(a.created_at).toLocaleDateString(),
          })), [
            { key: "pet", label: "Pet" }, { key: "species", label: "Species" },
            { key: "status", label: "Status" }, { key: "fee", label: "Fee" },
            { key: "approved", label: "Approved" }, { key: "owner", label: "Owner" },
            { key: "adopter", label: "Adopter" }, { key: "description", label: "Description" },
            { key: "date", label: "Date" },
          ])}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <Card className="mt-8">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Adopter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No adoption listings.</TableCell></TableRow>
                ) : listings.map((listing: any) => (
                  <TableRow key={listing.id} className={!listing.admin_approved ? "opacity-60" : ""}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{listing.pets?.name}</span>
                        <span className="ml-2 text-xs font-mono text-muted-foreground">{listing.pets?.pet_code}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{listing.ownerEmail}</TableCell>
                    <TableCell>{listing.adoption_fee > 0 ? `$${listing.adoption_fee}` : "Free"}</TableCell>
                    <TableCell><Badge className={statusColors[listing.status] || "bg-muted"}>{listing.status}</Badge></TableCell>
                    <TableCell>
                      {listing.admin_approved
                        ? <Badge className="bg-emerald-100 text-emerald-700"><Eye className="mr-1 h-3 w-3" />Visible</Badge>
                        : <Badge className="bg-amber-100 text-amber-700"><EyeOff className="mr-1 h-3 w-3" />Hidden</Badge>}
                    </TableCell>
                    <TableCell className="text-sm">{listing.adopterEmail || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant={listing.admin_approved ? "outline" : "default"} className="gap-1" onClick={() => handleToggleVisibility(listing.id, listing.admin_approved)}>
                          {listing.admin_approved ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Show</>}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditListing({ ...listing })}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(listing.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!editListing} onOpenChange={(o) => !o && setEditListing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Adoption Listing</DialogTitle></DialogHeader>
            {editListing && (
              <div className="space-y-4 pt-2">
                <div><Label>Description</Label><Textarea value={editListing.description || ""} onChange={(e) => setEditListing({ ...editListing, description: e.target.value })} rows={4} /></div>
                <div><Label>Adoption Fee ($)</Label><Input type="number" value={editListing.adoption_fee || 0} onChange={(e) => setEditListing({ ...editListing, adoption_fee: e.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editListing.status} onChange={(e) => setEditListing({ ...editListing, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <Label>Publicly Visible</Label>
                  <input type="checkbox" checked={editListing.admin_approved} onChange={(e) => setEditListing({ ...editListing, admin_approved: e.target.checked })} className="h-4 w-4" />
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

export default AdminAdoptions;
