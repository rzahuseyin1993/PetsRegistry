import Navbar from "@/components/Navbar";
import CmsRenderer from "@/components/CmsRenderer";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, MapPin, Clock, Gift, FileDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { generateLostFlyer } from "@/lib/generateLostFlyer";
import { motion } from "framer-motion";

const LostPetsPage = () => {
  const { data: lostReports = [], isLoading } = useQuery({
    queryKey: ["all-lost-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lost_reports")
        .select("*, pets(id, name, species, breed, color, pet_images(image_url, sort_order))")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDownloadFlyer = async (report: any) => {
    const pet = report.pets;
    const image = pet?.pet_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
    await generateLostFlyer({
      petName: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      color: pet.color || undefined,
      description: report.description || undefined,
      lastSeenAddress: report.last_seen_address || undefined,
      reward: report.reward || undefined,
      contactPhone: report.contact_phone || undefined,
      petId: pet.id,
      imageUrl: image?.image_url,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <CmsRenderer slug="lost-pets" fallback={
      <main className="flex-1 py-10">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Lost Pets</h1>
            <p className="mt-2 text-muted-foreground">
              Help reunite these pets with their families. If you spot any of them, please contact the owner.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-16 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : lostReports.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-lg text-muted-foreground">🎉 No lost pets right now!</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lostReports.map((report: any, i: number) => {
                const pet = report.pets;
                if (!pet) return null;
                const image = pet.pet_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden border-destructive/20 transition-shadow hover:shadow-lg">
                      <Link to={`/pet/${pet.id}`}>
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={image?.image_url || "/placeholder.svg"}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                          <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground animate-pulse">
                            LOST
                          </Badge>
                          {report.reward && (
                            <Badge className="absolute right-3 top-3 bg-success text-success-foreground gap-1">
                              <Gift className="h-3 w-3" /> Reward: {report.reward}
                            </Badge>
                          )}
                        </div>
                      </Link>
                      <CardContent className="p-4">
                        <Link to={`/pet/${pet.id}`}>
                          <h3 className="font-display text-lg font-bold text-foreground">{pet.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{pet.species} • {pet.breed}</p>
                        {report.last_seen_address && (
                          <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                            <MapPin className="h-3.5 w-3.5" /> {report.last_seen_address}
                          </p>
                        )}
                        {report.description && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={(e) => { e.preventDefault(); handleDownloadFlyer(report); }}
                          >
                            <FileDown className="h-3 w-3" /> Download Flyer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      } />
      <Footer />
    </div>
  );
};

export default LostPetsPage;
