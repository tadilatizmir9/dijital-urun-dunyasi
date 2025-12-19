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
    const { redirectId } = await req.json();

    if (!redirectId) {
      return new Response(
        JSON.stringify({ error: "Missing redirectId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Redirect kaydını çek
    const { data: redirect, error: redirectError } = await supabase
      .from("redirects")
      .select("id, target_url")
      .eq("id", redirectId)
      .single();

    if (redirectError || !redirect) {
      return new Response(
        JSON.stringify({ error: "Redirect not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // target_url boşsa
    if (!redirect.target_url || redirect.target_url.trim() === "") {
      await supabase
        .from("redirects")
        .update({
          last_status_code: 0,
          last_error: "missing_target_url",
          last_checked_at: new Date().toISOString(),
        })
        .eq("id", redirectId);

      return new Response(
        JSON.stringify({
          success: true,
          status_code: 0,
          error: "missing_target_url",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // URL kontrolü yap
    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; DijitalstokBot/1.0; +https://www.dijitalstok.com)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };

    let statusCode = 0;
    let label = "error";
    let message = "Bilinmeyen hata";
    let error: string | null = null;

    try {
      // Önce HEAD isteği dene
      const headResponse = await fetch(redirect.target_url, {
        method: "HEAD",
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(10000), // 10 saniye timeout
      });
      statusCode = headResponse.status;

      // HEAD başarısız olursa (401/403/405/429 veya non-2xx/3xx) GET dene
      if ([401, 403, 405, 429].includes(statusCode) || (statusCode < 200 || statusCode >= 400)) {
        try {
          const getResponse = await fetch(redirect.target_url, {
            method: "GET",
            headers,
            redirect: "follow",
            signal: AbortSignal.timeout(10000),
          });
          statusCode = getResponse.status;
        } catch (getError) {
          // GET de başarısız oldu, HEAD sonucunu kullan
        }
      }
    } catch (fetchError) {
      statusCode = 0;
      error = fetchError instanceof Error ? fetchError.message : "Network error";
    }

    // Status koduna göre label ve message belirle
    if (statusCode >= 200 && statusCode < 400) {
      label = "ok";
      message = "Link çalışıyor";
    } else if (statusCode === 404 || statusCode === 410) {
      label = "broken";
      message = "Link bulunamadı (404/410)";
    } else if ([401, 403, 429].includes(statusCode)) {
      label = "blocked";
      if (statusCode === 403) {
        message = "Erişim engellendi (403) – site bot kontrolü yapıyor.";
      } else if (statusCode === 401) {
        message = "Yetkilendirme gerekli (401) – site bot kontrolü yapıyor.";
      } else {
        message = "Çok fazla istek (429) – site bot kontrolü yapıyor.";
      }
    } else if (statusCode >= 500 && statusCode < 600) {
      label = "error";
      message = `Sunucu hatası (${statusCode})`;
    } else if (statusCode === 0) {
      label = "error";
      message = error || "Bağlantı hatası";
    } else {
      label = "error";
      message = `Beklenmeyen durum kodu: ${statusCode}`;
    }

    const ok = label === "ok";

    // Sonucu DB'ye yaz
    await supabase
      .from("redirects")
      .update({
        last_status_code: statusCode,
        last_error: message, // Message'ı last_error'a yazıyoruz
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", redirectId);

    return new Response(
      JSON.stringify({
        ok,
        status_code: statusCode,
        label,
        message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

