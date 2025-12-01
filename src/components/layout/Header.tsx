import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glassmorphism shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
              <span className="text-2xl font-black">D</span>
            </div>
            <span className="text-2xl font-black text-foreground tracking-tighter">Dijitalstok</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/urunler" className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
              Ürünler
            </Link>
            <Link to="/kategoriler" className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
              Kategoriler
            </Link>
            <Link to="/blog" className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200">
              Blog
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <Link to="/arama">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" className="rounded-full font-semibold border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                Yönetici
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
