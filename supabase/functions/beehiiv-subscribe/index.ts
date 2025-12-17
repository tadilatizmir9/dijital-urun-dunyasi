import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BEEHIIV_FORM_ID = "bf20ddac-e0ef-4a56-b857-8ca1da93ef2d";
const BEEHIIV_ENDPOINT = `https://subscribe-forms.beehiiv.com/${BEEHIIV_FORM_ID}`;

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "method_not_allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { email } = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "invalid_email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const trimmedEmail = email.trim();

    // Basic email validation: contains '@' and '.'
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      return new Response(
        JSON.stringify({ error: "invalid_email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare form-urlencoded data
    const formData = new URLSearchParams();
    formData.append("email", trimmedEmail);
    formData.append("react", "true");

    // Make request to Beehiiv
    const beehiivResponse = await fetch(BEEHIIV_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
      },
      body: formData.toString(),
    });

    // Handle Beehiiv response
    if (!beehiivResponse.ok) {
      const responseText = await beehiivResponse.text();
      const bodySnippet = responseText.substring(0, 200); // First 200 chars

      return new Response(
        JSON.stringify({
          error: "beehiiv_failed",
          status: beehiivResponse.status,
          body: bodySnippet,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success
    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Beehiiv subscribe error:", err);
    return new Response(
      JSON.stringify({ error: "server_error", message: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

