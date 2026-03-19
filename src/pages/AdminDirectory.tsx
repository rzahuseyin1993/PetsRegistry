import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Star, Trash2, Crown, Download, Pencil, EyeOff, Eye } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";

const categories = [
  { value: "pet_shop", label: "Pet Shop" },
  { value: "veterinary", label: "Veterinary" },
  { value: "grooming", label: "Grooming" },
  { value: "boarding", label: "Boarding" },
  { value: "training", label: "Training" },
  { value: "pet_food", label: "Pet Food" },
  { value: "other", label: "Other" },
];

const AdminDirectory = () => {
  const queryClient = useQueryClient();
  const [editListing, setEditListing] = useState<any>(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["admin-business-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-directory-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, email");
      return data || [];
    },
  });

  const getOwnerName = (ownerId: string) => {
    const p = profiles.find((p: any) => p.user_id === ownerId);
    return p?.full_name || p?.email || ownerId.slice(0, 8);
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("business_listings").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business-listings"] });
      toast({ title: "Listing updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("business_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-business-listings"] });
      toast({ title: "Listing deleted" });
    },
  });

  const handleEditOpen = (listing: any) => {
    setEditListing({ ...listing });
  };

  const handleEditSave = () => {
    if (!editListing) return;
    updateMutation.mutate({
      id: editListing.id,
      updates: {
        name: editListing.name,
        description: editListing.description,
        category: editListing.category,
        address: editListing.address,
        city: editListing.city,
        country: editListing.country,
        phone: editListing.phone,
        email: editListing.email,
        website: editListing.website,
        is_approved: editListing.is_approved,
        is_featured: editListing.is_featured,
        is_paid: editListing.is_paid,
        is_active: editListing.is_active,
      },
    });
    setEditListing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Permanently delete this business listing?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Business Directory Management</h1>
            <p className="text-sm text-muted-foreground">Full control: edit all fields, toggle visibility, change partner status, or delete listings.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => exportToCsv("directory", listings.map((l: any) => ({
            name: l.name, category: l.category, city: l.city || "", country: l.country || "",
            phone: l.phone || "", email: l.email || "", website: l.website || "",
            owner: getOwnerName(l.owner_id), approved: l.is_approved ? "Yes" : "No",
            paid: l.is_paid ? "Yes" : "No", featured: l.is_featured ? "Yes" : "No",
            active: l.is_active ? "Yes" : "No",
            date: new Date(l.created_at).toLocaleDateString(),
          })), [
            { key: "name", label: "Business Name" }, { key: "category", label: "Category" },
            { key: "city", label: "City" }, { key: "country", label: "Country" },
            { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
            { key: "website", label: "Website" }, { key: "owner", label: "Owner" },
            { key: "approved", label: "Approved" }, { key: "paid", label: "Paid" },
            { key: "featured", label: "Featured" }, { key: "active", label: "Active" },
            { key: "date", label: "Created" },
          ])}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : listings.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No listings yet</p>
        ) : (
          <div className="space-y-3">
            {listings.map((listing: any) => (
              <Card key={listing.id} className={!listing.is_active ? "opacity-60" : ""}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{listing.name}</h3>
                      {listing.is_approved ? <Badge className="bg-green-100 text-green-800">Approved</Badge> : <Badge variant="destructive">Pending</Badge>}
                      {!listing.is_active && <Badge variant="outline"><EyeOff className="mr-1 h-3 w-3" />Inactive</Badge>}
                      {listing.is_paid ? (
                        <Badge variant="secondary"><Crown className="mr-1 h-3 w-3" />Paid Partner</Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                      {listing.is_featured && <Badge className="bg-accent text-accent-foreground"><Star className="mr-1 h-3 w-3" />Featured</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{listing.category} • {listing.city || "N/A"} • Owner: {getOwnerName(listing.owner_id)}</p>
                    {listing.description && <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">{listing.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Approved</span>
                      <Switch
                        checked={listing.is_approved}
                        onCheckedChange={(v) => updateMutation.mutate({ id: listing.id, updates: { is_approved: v } })}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Featured</span>
                      <Switch
                        checked={listing.is_featured}
                        onCheckedChange={(v) => updateMutation.mutate({ id: listing.id, updates: { is_featured: v } })}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Active</span>
                      <Switch
                        checked={listing.is_active}
                        onCheckedChange={(v) => updateMutation.mutate({ id: listing.id, updates: { is_active: v } })}
                      />
                    </div>
                    <Select
                      value={listing.is_paid ? "paid" : "free"}
                      onValueChange={(v) => updateMutation.mutate({ id: listing.id, updates: { is_paid: v === "paid" } })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid Partner</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => handleEditOpen(listing)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(listing.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Full Edit Dialog */}
        <Dialog open={!!editListing} onOpenChange={(o) => { if (!o) setEditListing(null); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit Business Listing</DialogTitle></DialogHeader>
            {editListing && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Business Name</Label>
                  <Input value={editListing.name} onChange={(e) => setEditListing({ ...editListing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={editListing.category} onValueChange={(v) => setEditListing({ ...editListing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={editListing.description || ""} onChange={(e) => setEditListing({ ...editListing, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Address</Label><Input value={editListing.address || ""} onChange={(e) => setEditListing({ ...editListing, address: e.target.value })} /></div>
                  <div><Label>City</Label><Input value={editListing.city || ""} onChange={(e) => setEditListing({ ...editListing, city: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Country</Label><Input value={editListing.country || ""} onChange={(e) => setEditListing({ ...editListing, country: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={editListing.phone || ""} onChange={(e) => setEditListing({ ...editListing, phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input type="email" value={editListing.email || ""} onChange={(e) => setEditListing({ ...editListing, email: e.target.value })} /></div>
                  <div><Label>Website</Label><Input value={editListing.website || ""} onChange={(e) => setEditListing({ ...editListing, website: e.target.value })} /></div>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editListing.is_approved} onChange={(e) => setEditListing({ ...editListing, is_approved: e.target.checked })} className="h-4 w-4" />
                    <Label className="mb-0">Approved</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editListing.is_featured} onChange={(e) => setEditListing({ ...editListing, is_featured: e.target.checked })} className="h-4 w-4" />
                    <Label className="mb-0">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editListing.is_paid} onChange={(e) => setEditListing({ ...editListing, is_paid: e.target.checked })} className="h-4 w-4" />
                    <Label className="mb-0">Paid Partner</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editListing.is_active} onChange={(e) => setEditListing({ ...editListing, is_active: e.target.checked })} className="h-4 w-4" />
                    <Label className="mb-0">Active</Label>
                  </div>
                </div>
                <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDirectory;
