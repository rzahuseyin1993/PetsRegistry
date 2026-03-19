import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Crown, Check, Shield, Star, ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardMembership = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myMemberships = [], isLoading: loadingMemberships } = useQuery({
    queryKey: ["my-all-memberships"],
    queryFn: async () => {
      const { data } = await supabase
        .from("memberships")
        .select("*, membership_plans(name, slug, plan_type, features, price)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("membership_plans").select("*").eq("is_active", true).order("price");
      if (error) throw error;
      return data;
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Please sign in first");
      const plan = plans.find((p: any) => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const { data, error } = await supabase.functions.invoke("membership-checkout", {
        body: { planId, userId: user.id },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["my-all-memberships"] });
        queryClient.invalidateQueries({ queryKey: ["sidebar-membership"] });
        toast({ title: "Membership activated!", description: `You are now a ${plan.name}` });
      }
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const activeMemberships = myMemberships.filter((m: any) => m.status === "active" && new Date(m.expires_at) > new Date());
  const expiredMemberships = myMemberships.filter((m: any) => m.status !== "active" || new Date(m.expires_at) <= new Date());

  const hasActivePlan = (planSlug: string) =>
    activeMemberships.some((m: any) => (m as any).membership_plans?.slug === planSlug);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">        
        <h1 className="font-display text-2xl font-bold text-foreground">
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <MobileSidebar />My Membership
          </div>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your membership plans and benefits</p>

        {/* Active Memberships */}
        {activeMemberships.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Active Plans</h2>
            {activeMemberships.map((m: any) => (
              <Card key={m.id} className="border-primary/30 bg-primary/5">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    {(m as any).membership_plans?.plan_type === "partner" ? (
                      <Crown className="h-8 w-8 text-accent" />
                    ) : (
                      <Shield className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">{(m as any).membership_plans?.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Expires {new Date(m.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Available Plans */}
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {activeMemberships.length > 0 ? "Upgrade or Add Plans" : "Choose a Plan"}
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {plans.map((plan: any) => {
              const subscribed = hasActivePlan(plan.slug);
              const features = Array.isArray(plan.features) ? plan.features : [];
              return (
                <Card key={plan.id} className={`relative overflow-hidden ${plan.plan_type === "partner" ? "border-accent ring-1 ring-accent/30" : ""}`}>
                  {plan.plan_type === "partner" && (
                    <div className="absolute right-0 top-0 rounded-bl-xl bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      <Star className="mr-1 inline h-3 w-3" />Best for Business
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {plan.plan_type === "guardian" ? <Shield className="h-8 w-8 text-primary" /> : <Crown className="h-8 w-8 text-accent" />}
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      ${plan.price}<span className="text-base font-normal text-muted-foreground">/year</span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {subscribed ? (
                        <Badge className="w-full justify-center bg-green-100 py-2 text-green-800">Active</Badge>
                      ) : (
                        <Button className="w-full gap-2" onClick={() => subscribeMutation.mutate(plan.id)} disabled={subscribeMutation.isPending}>
                          {subscribeMutation.isPending ? "Processing..." : `Subscribe for $${plan.price}/year`}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* History */}
        {expiredMemberships.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-foreground">Membership History</h2>
            <div className="mt-4 space-y-3">
              {expiredMemberships.map((m: any) => (
                <Card key={m.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{(m as any).membership_plans?.name || "Plan"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(m.starts_at).toLocaleDateString()} — {new Date(m.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardMembership;
