import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { slug } = await req.json();

    if (!slug) {
      return new Response("Missing slug", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("redirects")
      .select("id, target_url, click_count")
      .eq("slug", slug)
      .single();

    if (error || !data?.target_url) {
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    await supabase
      .from("redirects")
      .update({ click_count: (data.click_count || 0) + 1 })
      .eq("id", data.id);

    return new Response(JSON.stringify({ target_url: data.target_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});