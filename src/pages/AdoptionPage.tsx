import Navbar from "@/components/Navbar";
import CmsRenderer from "@/components/CmsRenderer";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, DollarSign, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AdoptionPage = () => {
  const { user } = useAuth();

  const { data: listings = [], refetch } = useQuery({
    queryKey: ["adoption-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_adoptions")
        .select("*, pets(id, name, species, breed, age, color, pet_code, pet_images(image_url, sort_order))")
        .eq("status", "available")
        .eq("admin_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleAdoptRequest = async (adoptionId: string) => {
    if (!user) { toast.error("Please sign in to adopt"); return; }
    const { error } = await supabase
      .from("pet_adoptions")
      .update({ adopter_id: user.id, status: "pending" })
      .eq("id", adoptionId);
    if (error) toast.error("Failed to send adoption request");
    else { toast.success("Adoption request sent! The owner will review it."); refetch(); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <CmsRenderer slug="adoption" fallback={
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
              <Heart className="h-8 w-8 text-rose-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Adopt a Pet</h1>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Give a loving pet a new forever home. Browse pets available for adoption below.
            </p>
          </div>
        </section>

        <section className="container py-10">
          {listings.length === 0 ? (
            <div className="py-20 text-center">
              <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/20" />
              <p className="mt-4 text-lg text-muted-foreground">No pets available for adoption right now.</p>
              <p className="text-sm text-muted-foreground">Check back soon or list your pet for adoption from the dashboard.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing: any) => {
                const pet = listing.pets;
                const image = pet?.pet_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
                return (
                  <Card key={listing.id} className="group overflow-hidden border-border transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={image?.image_url || "/placeholder.svg"}
                        alt={pet?.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <Badge className="absolute left-3 top-3 bg-rose-500 text-white">
                        <Heart className="mr-1 h-3 w-3" /> For Adoption
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-display text-lg font-bold text-foreground">{pet?.name}</h3>
                      <p className="text-sm text-muted-foreground">{pet?.species} • {pet?.breed || "Mixed"}</p>
                      {pet?.age && <p className="text-sm text-muted-foreground">Age: {pet.age}</p>}
                      {listing.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        {listing.adoption_fee > 0 ? (
                          <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                            <DollarSign className="h-4 w-4" /> {listing.adoption_fee}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-emerald-600">Free</span>
                        )}
                        {user && user.id !== listing.owner_id ? (
                          <Button size="sm" className="gap-2" onClick={() => handleAdoptRequest(listing.id)}>
                            <Heart className="h-4 w-4" /> Adopt
                          </Button>
                        ) : !user ? (
                          <Link to="/login">
                            <Button size="sm" variant="outline">Sign in to Adopt</Button>
                          </Link>
                        ) : (
                          <Badge variant="secondary">Your listing</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
      } />
      <Footer />
    </div>
  );
};

export default AdoptionPage;
