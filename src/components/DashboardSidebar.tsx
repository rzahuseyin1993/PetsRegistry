import { Link, useLocation } from "react-router-dom";
import { PawPrint, LayoutDashboard, PlusCircle, Settings, Store, LogOut, Heart, Activity, AlertTriangle, FileText, Building2, Crown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import MembershipBadge from "@/components/MembershipBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sidebarLinks = [
  { to: "/dashboard", label: "My Pets", icon: LayoutDashboard },
  { to: "/dashboard/inbox", label: "Inbox", icon: Mail },
  { to: "/dashboard/register-pet", label: "Register Pet", icon: PlusCircle },
  { to: "/dashboard/health", label: "Pet Health", icon: Activity },
  { to: "/dashboard/adoption", label: "Adoption", icon: Heart },
  { to: "/dashboard/lost-reports", label: "Lost Reports", icon: AlertTriangle },
  { to: "/dashboard/flyer-builder", label: "Flyer Builder", icon: FileText },
  { to: "/dashboard/directory", label: "My Listings", icon: Building2 },
  { to: "/dashboard/membership", label: "Membership", icon: Crown },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const DashboardSidebar = ({ mobile = false }) => {
  const location = useLocation();
  const { signOut, user, membership } = useAuth();

  const { data: activeMembership } = useQuery({
    queryKey: ["sidebar-membership", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("memberships")
        .select("*, membership_plans(name)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (    
    <aside
      className={`flex h-100 w-64 flex-col border-r border-border bg-card ${
        mobile ? "h-full" : "hidden md:flex"
      }`}
    >
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold">PetsRegistry</span>
        </div>
        {membership && (
          <div className="mt-2">
            <MembershipBadge planType={membership.planType} planName={membership.planName} size="sm" />
          </div>
        )}
      </div>
      <nav className="space-y-1 overflow-y-auto p-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}>
              <Icon className="h-5 w-5" />{link.label}
            </Link>
          );
        })}
      </nav>

      {!activeMembership && (
        <div className="border-t border-border p-4">
          <Link to="/dashboard/membership">
            <Button variant="outline" className="w-full gap-2 border-accent text-accent text-sm">
              <Crown className="h-4 w-4" /> Upgrade Plan
            </Button>
          </Link>
        </div>
      )}

      <div className="border-t border-border p-4">
        <Link to="/store">
          <Button variant="outline" className="mb-2 w-full gap-2 text-sm"><Store className="h-4 w-4" /> Visit Store</Button>
        </Link>
        <Button variant="ghost" className="w-full gap-2 text-sm text-muted-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
