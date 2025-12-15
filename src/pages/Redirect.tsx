import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-click`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ slug }),
        }
      );

      if (!res.ok) {
        setError(true);
        return;
      }

      const data = await res.json();
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
    <>
      <Helmet>
        <title>Yönlendiriliyorsunuz...</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
    </>
  );
}