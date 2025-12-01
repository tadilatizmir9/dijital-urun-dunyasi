import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Dijitalstok</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/urunler" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Ürünler
            </Link>
            <Link to="/kategoriler" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Kategoriler
            </Link>
            <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Link to="/arama">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" className="rounded-full">
                Yönetici
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
