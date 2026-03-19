import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { planId, userId } = await req.json();

    // Get the plan
    const { data: plan, error: planErr } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .single();
    if (planErr || !plan) throw new Error("Plan not found");

    // Check for existing active membership for this plan
    const { data: existing } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "You already have an active membership for this plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active payment settings
    const { data: paymentSettings } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (paymentSettings?.provider === "stripe" && paymentSettings.secret_key) {
      // Create Stripe checkout session
      const origin = req.headers.get("origin") || "http://localhost:5173";
      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paymentSettings.secret_key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "success_url": `${origin}/membership?success=true&plan=${planId}`,
          "cancel_url": `${origin}/membership?canceled=true`,
          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][unit_amount]": String(Math.round(plan.price * 100)),
          "line_items[0][price_data][product_data][name]": plan.name,
          "line_items[0][quantity]": "1",
          "metadata[user_id]": userId,
          "metadata[plan_id]": planId,
          "metadata[type]": "membership",
        }),
      });

      const session = await stripeRes.json();
      if (session.error) throw new Error(session.error.message);

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: create membership directly (for testing or no payment configured)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const { error: insertErr } = await supabase.from("memberships").insert({
      user_id: userId,
      plan_id: planId,
      status: "active",
      expires_at: expiresAt.toISOString(),
    });
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
