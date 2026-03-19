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

    const { amount, donorName, donorEmail, userId, packageId, message } = await req.json();

    if (!amount || amount <= 0) throw new Error("Invalid donation amount");

    // Get active payment settings
    const { data: paymentSettings } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (paymentSettings?.provider === "stripe" && paymentSettings.secret_key) {
      const origin = req.headers.get("origin") || "http://localhost:5173";

      // Create Stripe checkout session for donation
      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paymentSettings.secret_key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "success_url": `${origin}/donate?success=true`,
          "cancel_url": `${origin}/donate?canceled=true`,
          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
          "line_items[0][price_data][product_data][name]": `Donation to PetsRegistry`,
          "line_items[0][price_data][product_data][description]": message || "Thank you for your generous donation!",
          "line_items[0][quantity]": "1",
          "metadata[type]": "donation",
          "metadata[user_id]": userId || "",
          "metadata[package_id]": packageId || "",
          "metadata[donor_name]": donorName || "",
          "metadata[donor_email]": donorEmail || "",
          "metadata[message]": message || "",
          "submit_type": "donate",
        }),
      });

      const session = await stripeRes.json();
      if (session.error) throw new Error(session.error.message);

      // Record donation as pending
      await supabase.from("donations").insert({
        amount,
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        user_id: userId || null,
        package_id: packageId || null,
        message: message || null,
        payment_method: "stripe",
        payment_id: session.id,
        status: "pending",
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: record donation directly (no payment gateway configured)
    await supabase.from("donations").insert({
      amount,
      donor_name: donorName || null,
      donor_email: donorEmail || null,
      user_id: userId || null,
      package_id: packageId || null,
      message: message || null,
      payment_method: "manual",
      status: "completed",
    });

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
