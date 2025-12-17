import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/beehiiv-subscribe`;

export const BeehiivSubscribe = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Beehiiv subscribe error:", errorData);
        
        // Handle different error types
        if (errorData.error === "invalid_email") {
          setErrorMessage("Lütfen geçerli bir e-posta adresi girin.");
        } else if (errorData.error === "beehiiv_failed") {
          setErrorMessage("Abonelik işlemi başarısız oldu. Lütfen tekrar deneyin.");
        } else {
          setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
        setStatus("error");
        return;
      }

      const data = await response.json();

      if (data.ok) {
        // Success
        setStatus("success");
        setEmail("");
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 5000);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-14 flex-1 rounded-full bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm text-lg focus:bg-white/30 transition-colors disabled:opacity-50"
          required
        />
        <Button
          type="submit"
          size="lg"
          variant="secondary"
          disabled={loading}
          className="rounded-full h-14 px-8 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg transition-all duration-300 whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "Gönderiliyor..." : "Abone Ol"}
        </Button>
      </form>

      {/* Status Messages */}
      {status === "success" && (
        <div className="text-green-200 text-sm font-medium animate-fade-in">
          ✓ Başarıyla abone oldunuz! Teşekkürler.
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="text-red-200 text-sm font-medium animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Legal Text */}
      <p className="text-xs text-white/70 leading-relaxed">
        Abone olarak{" "}
        <Link
          to="/gizlilik-politikasi"
          className="underline hover:text-white transition-colors"
        >
          Gizlilik Politikası
        </Link>
        'nı kabul etmiş olursunuz.
      </p>
    </div>
  );
};

