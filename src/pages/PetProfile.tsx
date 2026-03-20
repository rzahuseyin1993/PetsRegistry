import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MembershipBadge from "@/components/MembershipBadge";
import { Mail, Phone, User, Calendar, Palette, Weight, QrCode, Shield, CheckCircle, Cpu } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const PetProfile = () => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { data: pet, isLoading } = useQuery({
    queryKey: ["pet-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*, pet_images(image_url, sort_order)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      const { data: ownerProfileJson } = await supabase.rpc("get_public_profile", { _user_id: data.owner_id });
      const ownerProfile = ownerProfileJson as { full_name: string | null; email: string; phone: string | null; show_name: boolean; show_phone: boolean } | null;
      // Check owner membership
      const { data: ownerMembership } = await supabase
        .from("memberships")
        .select("*, membership_plans(name, plan_type)")
        .eq("user_id", data.owner_id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();
      return { ...data, owner: ownerProfile, ownerMembership };
    },
  });

  const profileUrl = `${window.location.origin}/pet/${id}`;

  const statusStyles: Record<string, string> = {
    registered: "bg-success/10 text-success border-success/20",
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    found: "bg-accent/10 text-accent border-accent/20",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-lg text-muted-foreground">Pet not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const images = (pet.pet_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const owner = pet?.owner;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Verified badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-foreground">Verified Pet Profile</span>
              <span className="text-xs font-mono font-semibold text-primary">{(pet as any).pet_code || pet.id.slice(0, 10).toUpperCase()}</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Images - Main + Thumbnails side by side */}
              <div className="lg:col-span-2">
                {images.length > 0 && (
                  <div className="flex gap-3">
                    {/* Main image */}
                    <div className="flex-1 overflow-hidden rounded-2xl shadow-md">
                      <img
                        src={images[activeImage]?.image_url}
                        alt={pet.name}
                        className="aspect-[4/3] w-full object-cover cursor-pointer"
                      />
                    </div>
                    {/* Thumbnail strip on the right */}
                    {images.length > 1 && (
                      <div className="flex w-20 flex-col gap-2 md:w-24">
                        {images.slice(0, 5).map((img: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`overflow-hidden rounded-xl border-2 transition-all ${
                              i === activeImage
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-transparent hover:border-muted-foreground/30"
                            }`}
                          >
                            <img
                              src={img.image_url}
                              alt={`${pet.name} photo ${i + 1}`}
                              className="aspect-square w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Details Card */}
                <Card className="mt-6 border-border">
                  <CardContent className="p-5">
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {pet.age && (
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Age:</span>
                          </div>
                          <span className="font-medium pl-6">{pet.age}</span>
                        </div>
                      )}
                      {pet.color && (
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Color:</span>
                          </div>
                          <span className="font-medium pl-6">{pet.color}</span>
                        </div>
                      )}
                      {pet.weight && (
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Weight:</span>
                          </div>
                          <span className="font-medium pl-6">{pet.weight}</span>
                        </div>
                      )}
                      {pet.microchip_number && (
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Microchip:</span>
                          </div>
                          <span className="font-medium font-mono break-all pl-6">{pet.microchip_number}</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Pet ID:</span>
                        </div>
                        <span className="font-medium font-mono text-primary break-all pl-6">
                          {(pet as any).pet_code || pet.id.slice(0, 10).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center p-6">
                    <h3 className="mb-4 font-display font-semibold text-foreground">Pet QR Code</h3>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <QRCodeSVG value={profileUrl} size={160} />
                    </div>
                    <p className="mt-3 text-center text-xs text-muted-foreground">Scan to view this pet's profile</p>
                    <p className="mt-1 text-center text-xs font-mono font-semibold text-primary break-all">{(pet as any).pet_code || pet.id.toUpperCase()}</p>
                  </CardContent>
                </Card>

                {owner && (
                  <Card className="border-border">
                    <CardContent className="p-5">
                      <h3 className="mb-3 font-display font-semibold text-foreground">Contact Owner</h3>
                      {pet.ownerMembership && (pet.ownerMembership as any).membership_plans && (
                        <div className="mb-3">
                          <MembershipBadge
                            planType={(pet.ownerMembership as any).membership_plans.plan_type}
                            planName={(pet.ownerMembership as any).membership_plans.name}
                            size="sm"
                          />
                        </div>
                      )}
                      <div className="space-y-2.5">
                        <a href={`mailto:${owner.email}`} className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary hover:underline">{owner.email}</span>
                        </a>
                        {owner.show_name && owner.full_name && (
                          <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /><span>{owner.full_name}</span></div>
                        )}
                        {owner.show_phone && owner.phone && (
                          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{owner.phone}</span></div>
                        )}
                      </div>
                      <a href={`mailto:${owner.email}?subject=About your pet ${pet.name}`}>
                        <Button className="mt-4 w-full gap-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90">
                          <Mail className="h-4 w-4" /> Email Owner
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PetProfile;
