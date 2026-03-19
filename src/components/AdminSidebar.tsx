import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, Users, ShoppingBag, Settings, LayoutDashboard, LogOut, CreditCard, ShieldCheck, Layout, Heart, AlertTriangle, FileText, Building2, Crown, Mail, HandHeart } from "lucide-react";
import logo from "@/assets/logo.png";

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/pets", label: "All Pets", icon: PawPrint },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/orders", label: "Store Orders", icon: ShoppingBag },
  { to: "/admin/adoptions", label: "Adoptions", icon: Heart },
  { to: "/admin/lost-reports", label: "Lost Reports", icon: AlertTriangle },
  { to: "/admin/flyer-templates", label: "Flyer Templates", icon: FileText },
  { to: "/admin/directory", label: "Directory", icon: Building2 },
  { to: "/admin/memberships", label: "Memberships", icon: Crown },
  { to: "/admin/contacts", label: "Contact & Messages", icon: Mail },
  { to: "/admin/donations", label: "Donations", icon: HandHeart },
  { to: "/admin/payments", label: "Payment Settings", icon: CreditCard },
  { to: "/admin/page-builder", label: "Page Builder", icon: Layout },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex h-100 w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-4">
        <img src={logo} alt="Pets Registry" className="h-8 w-auto" />
      </div>
      <nav className="space-y-1 p-4">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Link to="/">
          <Button variant="ghost" className="w-full gap-2 text-sm text-muted-foreground">
            <LogOut className="h-4 w-4" /> Exit Admin
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
