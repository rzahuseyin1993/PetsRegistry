import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const MobileAdopt = () => {
  const { data: adoptions = [], isLoading } = useQuery({
    queryKey: ["mobile-adoptions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pet_adoptions")
        .select("*, pets(*, pet_images(image_url, sort_order))")
        .eq("status", "available")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" /> Adopt a Pet
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{adoptions.length} pets available</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : adoptions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No pets available for adoption right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {adoptions.map((a: any) => {
            const pet = a.pets;
            const img = pet?.pet_images?.sort((x: any, y: any) => x.sort_order - y.sort_order)[0];
            return (
              <Link key={a.id} to={`/pet/${pet?.id}`}>
                <Card className="overflow-hidden border-border/60 shadow-sm">
                  <div className="aspect-[4/3] bg-muted">
                    <img
                      src={img?.image_url || "/placeholder.svg"}
                      alt={pet?.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-2">
                    <p className="truncate text-xs font-semibold text-foreground">{pet?.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{pet?.breed || pet?.species}</p>
                    {a.adoption_fee > 0 && (
                      <Badge variant="secondary" className="mt-1 text-[9px] h-4 px-1.5">${a.adoption_fee}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileAdopt;
