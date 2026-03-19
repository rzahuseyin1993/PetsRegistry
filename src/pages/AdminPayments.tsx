import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const AdminPayments = () => {
  const queryClient = useQueryClient();
  const [stripePublishable, setStripePublishable] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeActive, setStripeActive] = useState(false);
  const [paypalClient, setPaypalClient] = useState("");
  const [paypalSecret, setPaypalSecret] = useState("");
  const [paypalActive, setPaypalActive] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only fetch publishable keys and active status — NOT secret keys
  const { data: settings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_settings").select("provider, publishable_key, is_active");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const stripe = settings.find((s) => s.provider === "stripe");
      const paypal = settings.find((s) => s.provider === "paypal");
      if (stripe) { setStripePublishable(stripe.publishable_key || ""); setStripeActive(stripe.is_active); }
      if (paypal) { setPaypalClient(paypal.publishable_key || ""); setPaypalActive(paypal.is_active); }
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Save Stripe settings via edge function
      await fetch(`${baseUrl}/functions/v1/save-payment-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider: "stripe",
          publishable_key: stripePublishable,
          secret_key: stripeSecret,
          is_active: stripeActive,
        }),
      });

      // Save PayPal settings via edge function
      await fetch(`${baseUrl}/functions/v1/save-payment-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          provider: "paypal",
          publishable_key: paypalClient,
          secret_key: paypalSecret,
          is_active: paypalActive,
        }),
      });

      // Clear secret fields after save (they're write-only now)
      setStripeSecret("");
      setPaypalSecret("");

      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
      toast.success("Payment settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Payment Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your payment gateway integrations</p>

        <form onSubmit={handleSave} className="mt-8 max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Stripe Integration</CardTitle>
                <Switch checked={stripeActive} onCheckedChange={setStripeActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Publishable Key</Label><Input type="text" placeholder="pk_live_..." value={stripePublishable} onChange={(e) => setStripePublishable(e.target.value)} /></div>
              <div className="space-y-2"><Label>Secret Key</Label><Input type="password" placeholder="Enter new secret key to update..." value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} /><p className="text-xs text-muted-foreground">Secret keys are write-only for security. Enter a new value to update.</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" />PayPal Integration</CardTitle>
                <Switch checked={paypalActive} onCheckedChange={setPaypalActive} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Client ID</Label><Input type="text" placeholder="Your PayPal Client ID" value={paypalClient} onChange={(e) => setPaypalClient(e.target.value)} /></div>
              <div className="space-y-2"><Label>Client Secret</Label><Input type="password" placeholder="Enter new client secret to update..." value={paypalSecret} onChange={(e) => setPaypalSecret(e.target.value)} /><p className="text-xs text-muted-foreground">Secrets are write-only for security. Enter a new value to update.</p></div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving..." : "Save Payment Settings"}</Button>
        </form>
      </main>
    </div>
  );
};

export default AdminPayments;
