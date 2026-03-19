import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface StoreProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const StoreProductCard = ({ name, price, image, description }: StoreProductCardProps) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`${name} added to cart!`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="group overflow-hidden border-border transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="aspect-square overflow-hidden bg-muted">
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-display text-base font-semibold text-card-foreground">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-xl font-bold text-primary">${price.toFixed(2)}</span>
            <Button size="sm" className="gap-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StoreProductCard;
