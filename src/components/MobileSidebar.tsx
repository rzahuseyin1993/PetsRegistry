import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileSidebar = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 w-64 max-w-full">        
        <DialogTitle className="sr-only">Navigation Menu</DialogTitle>

        <DashboardSidebar mobile />
      </DialogContent>
    </Dialog>
  );
};

export default MobileSidebar;