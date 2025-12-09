import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Giriş başarısız",
          description: error.message,
        });
        return;
      }

      // Check if user is admin using user_roles table
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!userRole) {
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Erişim reddedildi",
          description: "Admin yetkisine sahip değilsiniz.",
        });
        return;
      }

      toast({
        title: "Giriş başarılı",
        description: "Yönlendiriliyorsunuz...",
      });

      navigate("/admin");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bir hata oluştu",
        description: "Lütfen tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Yönetici Girişi – Dijitalstok</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Yönetici Girişi</h1>
            <p className="text-muted-foreground">
              Admin paneline erişmek için giriş yapın
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@dijitalstok.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
