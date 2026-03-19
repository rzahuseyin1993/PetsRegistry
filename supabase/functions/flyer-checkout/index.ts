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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Stripe keys from payment_settings
    const { data: paymentSettings } = await supabase
      .from("payment_settings")
      .select("secret_key, publishable_key")
      .eq("provider", "stripe")
      .eq("is_active", true)
      .single();

    if (!paymentSettings?.secret_key) {
      return new Response(JSON.stringify({ error: "Stripe is not configured. Please contact admin." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Stripe checkout session
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paymentSettings.secret_key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "subscription",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": "200",
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][price_data][product_data][name]": "Lost Pet Flyer Builder - Monthly",
        "line_items[0][quantity]": "1",
        "success_url": `${req.headers.get("origin") || supabaseUrl}/dashboard/flyer-builder?success=true`,
        "cancel_url": `${req.headers.get("origin") || supabaseUrl}/dashboard/flyer-builder?canceled=true`,
        "metadata[user_id]": user_id,
        "metadata[type]": "flyer_subscription",
      }),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error("Stripe error:", session);
      return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
