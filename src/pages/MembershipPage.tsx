import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CmsRenderer from "@/components/CmsRenderer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Crown, Check, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";

const MembershipPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("membership_plans").select("*").eq("is_active", true).order("price");
      if (error) throw error;
      return data;
    },
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("memberships")
        .select("*, membership_plans(name, slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString());
      return data || [];
    },
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Please sign in first");

      const plan = plans.find((p: any) => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      // Use the checkout edge function
      const { data, error } = await supabase.functions.invoke("membership-checkout", {
        body: { planId, userId: user.id },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["my-memberships"] });
        toast({ title: "Membership activated!", description: `You are now a ${plan.name}` });
      }
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const isSubscribed = (planSlug: string) => {
    return myMemberships.some((m: any) => (m as any).membership_plans?.slug === planSlug);
  };

  const featureIcons: Record<string, typeof Check> = {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CmsRenderer slug="membership" fallback={
      <>
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="container text-center">
          <Crown className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground">Membership Plans</h1>
          <p className="mt-3 text-lg text-muted-foreground">Unlock premium features with an annual membership</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading plans...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan: any) => {
              const subscribed = isSubscribed(plan.slug);
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
                        <Badge className="w-full justify-center bg-green-100 py-2 text-green-800">Active Membership</Badge>
                      ) : user ? (
                        <Button className="w-full" onClick={() => subscribeMutation.mutate(plan.id)} disabled={subscribeMutation.isPending}>
                          {subscribeMutation.isPending ? "Processing..." : `Subscribe for $${plan.price}/year`}
                        </Button>
                      ) : (
                        <Link to="/login"><Button className="w-full">Sign In to Subscribe</Button></Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </>
      } />
      <Footer />
    </div>
  );
};

export default MembershipPage;
