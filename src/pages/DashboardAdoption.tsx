import DashboardSidebar from "@/components/DashboardSidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Heart, Plus, CheckCircle, XCircle, Clock, ArrowRightLeft, Trash2, Pencil, EyeOff } from "lucide-react";

const DashboardAdoption = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [fee, setFee] = useState("");
  const [description, setDescription] = useState("");
  const [editListing, setEditListing] = useState<any>(null);

  const { data: pets = [] } = useQuery({
    queryKey: ["my-pets-for-adoption", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("id, name, species, breed")
        .eq("owner_id", user!.id)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-adoption-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_adoptions")
        .select("*, pets(id, name, species, breed, pet_images(image_url, sort_order))")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-adoption-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_adoptions")
        .select("*, pets(id, name, species, breed)")
        .eq("adopter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCreateListing = async () => {
    if (!selectedPetId || !user) return;
    const { error } = await supabase.from("pet_adoptions").insert({
      pet_id: selectedPetId,
      owner_id: user.id,
      adoption_fee: fee ? Number(fee) : 0,
      description: description || null,
    });
    if (error) { toast.error("Failed to create listing"); return; }
    toast.success("Pet listed for adoption!");
    setDialogOpen(false);
    setSelectedPetId("");
    setFee("");
    setDescription("");
    queryClient.invalidateQueries({ queryKey: ["my-adoption-listings"] });
  };

  const handleApproveAdoption = async (adoptionId: string, petId: string, adopterId: string) => {
    const { error: transferError } = await supabase
      .from("pets")
      .update({ owner_id: adopterId })
      .eq("id", petId);
    if (transferError) { toast.error("Failed to transfer pet"); return; }
    const { error } = await supabase
      .from("pet_adoptions")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", adoptionId);
    if (error) { toast.error("Failed to update adoption status"); return; }
    toast.success("Pet transferred to new owner successfully!");
    queryClient.invalidateQueries({ queryKey: ["my-adoption-listings"] });
    queryClient.invalidateQueries({ queryKey: ["my-pets"] });
  };

  const handleRejectAdoption = async (adoptionId: string) => {
    const { error } = await supabase
      .from("pet_adoptions")
      .update({ status: "available", adopter_id: null, updated_at: new Date().toISOString() })
      .eq("id", adoptionId);
    if (error) toast.error("Failed to reject");
    else { toast.success("Request rejected"); queryClient.invalidateQueries({ queryKey: ["my-adoption-listings"] }); }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const { error } = await supabase.from("pet_adoptions").delete().eq("id", id);
    if (error) toast.error("Failed to delete listing");
    else { toast.success("Listing deleted"); queryClient.invalidateQueries({ queryKey: ["my-adoption-listings"] }); }
  };

  const handleEditSave = async () => {
    if (!editListing) return;
    const { error } = await supabase.from("pet_adoptions").update({
      description: editListing.description,
      adoption_fee: editListing.adoption_fee ? Number(editListing.adoption_fee) : 0,
      status: editListing.status,
      updated_at: new Date().toISOString(),
    }).eq("id", editListing.id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Listing updated");
    setEditListing(null);
    queryClient.invalidateQueries({ queryKey: ["my-adoption-listings"] });
  };

  const statusColors: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="flex items-center gap-2 md:hidden">
                <MobileSidebar />
              </div>
              <Heart className="h-6 w-6 text-rose-500" /> Adoption Manager
            </h1>
            <p className="text-sm text-muted-foreground">List pets for adoption, edit listings, and manage requests</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> List Pet for Adoption</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>List a Pet for Adoption</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Select Pet</Label>
                  <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                    <SelectTrigger><SelectValue placeholder="Choose a pet..." /></SelectTrigger>
                    <SelectContent>
                      {pets.map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id}>{pet.name} ({pet.species})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adoption Fee ($)</Label>
                  <Input type="number" placeholder="0 for free" value={fee} onChange={e => setFee(e.target.value)} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Tell potential adopters about this pet..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleCreateListing}>Create Listing</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Listings */}
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">My Listings</h2>
        {myListings.length === 0 ? (
          <Card className="mb-8 border-dashed">
            <CardContent className="py-10 text-center">
              <Heart className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground">No adoption listings yet. List a pet to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-8 space-y-3">
            {myListings.map((listing: any) => {
              const pet = listing.pets;
              return (
                <Card key={listing.id} className="border-border">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                        {pet?.pet_images?.[0] && (
                          <img src={pet.pet_images[0].image_url} alt={pet.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{pet?.name} — {pet?.species}</p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[listing.status] || "bg-muted text-foreground"}>
                            {listing.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                            {listing.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                            {listing.status}
                          </Badge>
                          {listing.adoption_fee > 0 && <span className="text-sm text-muted-foreground">${listing.adoption_fee}</span>}
                          {listing.description && <span className="text-xs text-muted-foreground max-w-[200px] truncate">{listing.description}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {listing.status === "pending" && listing.adopter_id && (
                        <>
                          <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveAdoption(listing.id, listing.pet_id, listing.adopter_id)}>
                            <ArrowRightLeft className="h-3 w-3" /> Transfer
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectAdoption(listing.id)}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setEditListing({ ...listing })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteListing(listing.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* My Adoption Requests */}
        {myRequests.length > 0 && (
          <>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">My Adoption Requests</h2>
            <div className="space-y-3">
              {myRequests.map((req: any) => (
                <Card key={req.id} className="border-border">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Heart className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="font-medium text-foreground">{req.pets?.name} — {req.pets?.species}</p>
                      <Badge className={statusColors[req.status] || "bg-muted"}>
                        {req.status === "pending" ? "Awaiting approval" : req.status === "completed" ? "Adopted!" : req.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editListing} onOpenChange={(o) => !o && setEditListing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Adoption Listing</DialogTitle></DialogHeader>
            {editListing && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Description</Label>
                  <Textarea value={editListing.description || ""} onChange={(e) => setEditListing({ ...editListing, description: e.target.value })} rows={4} />
                </div>
                <div>
                  <Label>Adoption Fee ($)</Label>
                  <Input type="number" value={editListing.adoption_fee || 0} onChange={(e) => setEditListing({ ...editListing, adoption_fee: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editListing.status} onChange={(e) => setEditListing({ ...editListing, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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

export default DashboardAdoption;
