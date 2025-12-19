import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-click",
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

    // Check if this is a test click (from header)
    const isAdminClick = req.headers.get("x-admin-click") === "true";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("redirects")
      .select("id, target_url, click_count, product_id")
      .eq("slug", slug)
      .single();

    if (error || !data?.target_url) {
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Click count'u güncelle (sadece test click değilse)
    if (!isAdminClick) {
      await supabase
        .from("redirects")
        .update({ click_count: (data.click_count || 0) + 1 })
        .eq("id", data.id);
    }

    // Click event ekle (sadece test click değilse)
    if (!isAdminClick) {
      try {
        await supabase
          .from("redirect_click_events")
          .insert({
            redirect_id: data.id,
            product_id: data.product_id || null,
          });
      } catch (eventError) {
        // Event insert başarısız olsa da devam et
        console.error("Failed to insert click event:", eventError);
      }
    } else {
      console.log("Test click ignored");
    }

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