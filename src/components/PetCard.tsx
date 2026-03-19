import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreVertical, AlertTriangle, CheckCircle, Shield } from "lucide-react";

interface PetCardProps {
  id: string;
  name: string;
  species: string;
  breed: string;
  image: string;
  petCode?: string;
  status?: "registered" | "lost" | "found";
  showStatusToggle?: boolean;
  onStatusChange?: (id: string, status: "registered" | "lost" | "found") => void;
}

const statusStyles: Record<string, string> = {
  registered: "bg-success text-success-foreground",
  lost: "bg-destructive text-destructive-foreground",
  found: "bg-accent text-accent-foreground",
};

const PetCard = ({ id, name, species, breed, image, petCode, status = "registered", showStatusToggle, onStatusChange }: PetCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/pet/${id}`}>
        <div className="aspect-square overflow-hidden">
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" width={400} height={400} />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link to={`/pet/${id}`} className="flex-1">
            <h3 className="font-display text-lg font-semibold text-card-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{species} {breed ? `• ${breed}` : ""}</p>
          </Link>
          <div className="flex items-center gap-1">
            <Badge className={statusStyles[status]}>{status}</Badge>
            {showStatusToggle && onStatusChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStatusChange(id, "registered")} className="gap-2">
                    <Shield className="h-4 w-4 text-success" /> Mark as Registered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(id, "lost")} className="gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Mark as Lost
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(id, "found")} className="gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" /> Mark as Found
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {petCode && <p className="mt-2 text-xs font-mono font-semibold text-primary">{petCode}</p>}
        {!petCode && <p className="mt-2 text-xs text-muted-foreground">ID: {id.slice(0, 8).toUpperCase()}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

export default PetCard;
