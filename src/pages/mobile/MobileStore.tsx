import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const MobileStore = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["mobile-store"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-emerald-500" /> Pet Store
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{products.length} products</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p: any) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-2.5 space-y-1.5">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">${p.price}</span>
                  {p.stock <= 0 && <Badge variant="destructive" className="text-[10px]">Sold out</Badge>}
                </div>
                <Button size="sm" className="w-full h-8 text-xs rounded-lg" disabled={p.stock <= 0} onClick={() => toast.info("Added to cart")}>
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileStore;
