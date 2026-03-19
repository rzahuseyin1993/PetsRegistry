import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Image, Building2, Crown, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { value: "pet_shop", label: "Pet Shop" },
  { value: "veterinary", label: "Veterinary" },
  { value: "grooming", label: "Grooming" },
  { value: "boarding", label: "Boarding" },
  { value: "training", label: "Training" },
  { value: "pet_food", label: "Pet Food" },
  { value: "other", label: "Other" },
];

const DashboardDirectory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "pet_shop", address: "", city: "", country: "", phone: "", email: "", website: "" });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["my-business-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_listings")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: membership } = useQuery({
    queryKey: ["my-partner-membership"],
    queryFn: async () => {
      const { data } = await supabase
        .from("memberships")
        .select("*, membership_plans(*)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single();
      return data;
    },
    enabled: !!user,
  });

  const isPaid = !!membership;

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editId) {
        const { error } = await supabase.from("business_listings").update(data).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("business_listings").insert({ ...data, owner_id: user!.id, is_paid: isPaid });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-listings"] });
      setDialogOpen(false);
      setEditId(null);
      setForm({ name: "", description: "", category: "pet_shop", address: "", city: "", country: "", phone: "", email: "", website: "" });
      toast({ title: editId ? "Listing updated" : "Listing created", description: "Your listing will appear after admin approval." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("business_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business-listings"] });
      toast({ title: "Listing deleted" });
    },
  });

  const handleEdit = (listing: any) => {
    setEditId(listing.id);
    setForm({ name: listing.name, description: listing.description || "", category: listing.category, address: listing.address || "", city: listing.city || "", country: listing.country || "", phone: listing.phone || "", email: listing.email || "", website: listing.website || "" });
    setDialogOpen(true);
  };

  const uploadImage = async (listingId: string, file: File) => {
    const path = `${user!.id}/${listingId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("business-listings").upload(path, file);
    if (uploadErr) throw uploadErr;
    const { data: { publicUrl } } = supabase.storage.from("business-listings").getPublicUrl(path);
    await supabase.from("business_listing_images").insert({ listing_id: listingId, image_url: publicUrl });
    queryClient.invalidateQueries({ queryKey: ["my-business-listings"] });
    toast({ title: "Image uploaded" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              <div className="flex items-center gap-2 md:hidden">
                <MobileSidebar />
                My Business Listings
              </div>
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPaid ? "You have an active Verified Partner membership" : "Free listing (text only)"}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm({ name: "", description: "", category: "pet_shop", address: "", city: "", country: "", phone: "", email: "", website: "" }); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Listing</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Listing" : "Add Business Listing"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                <div>
                  <Label>Business Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                  <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editId ? "Update Listing" : "Submit Listing"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!isPaid && (
          <Card className="mb-6 border-accent bg-gradient-to-r from-accent/5 to-primary/5">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-accent" />
                  <h3 className="font-display text-lg font-bold text-foreground">Upgrade to Verified Partner</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">You're on the <strong>Free plan</strong> (text-only listing). Upgrade to unlock:</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" />Dedicated business profile page</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" />Photo gallery for your business</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" />WhatsApp & Email contact buttons</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" />"Verified Partner" badge on directory</li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" />Priority listing placement</li>
                </ul>
              </div>
              <Link to="/membership">
                <Button className="gap-2 whitespace-nowrap">
                  Upgrade Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 font-semibold">No listings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add your first business listing to appear in the directory</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((listing: any) => (
              <Card key={listing.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{listing.name}</h3>
                      {listing.is_approved ? <Badge className="bg-green-100 text-green-800">Approved</Badge> : <Badge variant="outline">Pending</Badge>}
                      {listing.is_paid && <Badge variant="secondary">Paid</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{listing.category} • {listing.city || "No city"}</p>
                  </div>
                  <div className="flex gap-2">
                    {listing.is_paid && (
                      <label>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) uploadImage(listing.id, e.target.files[0]);
                        }} />
                        <Button variant="outline" size="icon" asChild><span><Image className="h-4 w-4" /></span></Button>
                      </label>
                    )}
                    <Button variant="outline" size="icon" onClick={() => handleEdit(listing)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(listing.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardDirectory;
