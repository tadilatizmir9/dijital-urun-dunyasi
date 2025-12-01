import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import newsletterImage from "@/assets/newsletter-illustration.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/20 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Yeniliklerden Haberdar Ol</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Yeni ürünler, özel indirimler ve dijital içerik fırsatlarından ilk sen haberdar ol.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-posta adresin"
                  className="rounded-full"
                />
                <Button className="rounded-full px-6">
                  Abone Ol
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <img
                src={newsletterImage}
                alt="Newsletter"
                className="w-64 h-64 object-contain animate-float"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">D</span>
              </div>
              <span className="text-xl font-bold text-foreground">Dijitalstok</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Dijital yaratıcılar için seçilmiş mockup, şablon ve stok içerikler. 
              Aradığın dijital içeriği saniyeler içinde keşfet.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Sayfalar</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/urunler" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link to="/kategoriler" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Bilgi</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/hakkinda" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hakkında
                </Link>
              </li>
              <li>
                <Link to="/iletisim" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/affiliate-disclosure" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Affiliate Bildirimi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-center text-muted-foreground">
            © 2025 Dijitalstok.com. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};
