import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
              <li>
                <Link to="/cerez-politikasi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Çerez Politikası
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
