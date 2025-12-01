import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Redirect() {
  const { slug } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      handleRedirect();
    }
  }, [slug]);

  const handleRedirect = async () => {
    try {
      // Fetch redirect info
      const { data, error: fetchError } = await supabase
        .from("redirects")
        .select("target_url, click_count")
        .eq("slug", slug)
        .single();

      if (fetchError || !data) {
        setError(true);
        return;
      }

      // Update click count
      await supabase
        .from("redirects")
        .update({
          click_count: (data.click_count || 0) + 1,
          last_checked_at: new Date().toISOString(),
        })
        .eq("slug", slug);

      // Redirect to target URL
      window.location.href = data.target_url;
    } catch (err) {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">❌</div>
          <h1 className="text-2xl font-bold text-foreground">
            Bu ürün bulunamadı
          </h1>
          <p className="text-muted-foreground">
            Bu link güncel değil veya ürün kaldırılmış olabilir.
          </p>
          <Link to="/">
            <Button size="lg" className="rounded-full">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">
          Yönlendiriliyorsunuz...
        </h1>
        <p className="text-muted-foreground">
          Lütfen bekleyin, orijinal siteye yönlendiriliyorsunuz.
        </p>
      </div>
    </div>
  );
}
