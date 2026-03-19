import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const MobileLostPets = () => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["mobile-lost-pets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lost_reports")
        .select("*, pets(*, pet_images(image_url, sort_order))")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Lost Pets
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{reports.length} active reports</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No lost pet reports. Great news!</p>
      ) : (
        <div className="space-y-2.5">
          {reports.map((r: any) => {
            const pet = r.pets;
            const img = pet?.pet_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
            return (
              <Link key={r.id} to={`/pet/${pet?.id}`}>
                <Card className="overflow-hidden border-border/60 shadow-sm">
                  <div className="flex">
                    <div className="h-20 w-20 shrink-0 bg-muted">
                      <img
                        src={img?.image_url || "/placeholder.svg"}
                        alt={pet?.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="flex-1 p-2.5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-foreground">{pet?.name}</p>
                        <Badge variant="destructive" className="text-[9px] h-4 px-1.5">LOST</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{pet?.breed || pet?.species}</p>
                      {r.last_seen_address && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 leading-tight">
                          <MapPin className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{r.last_seen_address}</span>
                        </p>
                      )}
                      {r.reward && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-amber-100 text-amber-700">Reward: {r.reward}</Badge>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileLostPets;
