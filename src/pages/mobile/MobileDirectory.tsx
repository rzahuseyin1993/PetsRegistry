import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const MobileDirectory = () => {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["mobile-directory"],
    queryFn: async () => {
      const { data } = await supabase
        .from("business_listings")
        .select("*")
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("is_featured", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-orange-500" /> Business Directory
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{listings.length} listings</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l: any) => (
            <Link key={l.id} to={`/directory/${l.id}`}>
              <Card>
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{l.name}</p>
                    {l.is_featured && <Badge className="text-[10px] bg-accent text-accent-foreground">Featured</Badge>}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{l.category}</Badge>
                  {l.city && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {l.city}{l.country ? `, ${l.country}` : ""}
                    </p>
                  )}
                  {l.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{l.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileDirectory;
