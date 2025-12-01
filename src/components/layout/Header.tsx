import { Link } from "react-router-dom";
import { Search, ChevronDown, Palette, Sparkles, Image as ImageIcon, FileText, Wand2, Layers, Package, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useFavorites } from "@/hooks/useFavorites";

const iconMap: Record<string, any> = {
  "🎨": Palette,
  "✨": Sparkles,
  "🖼️": ImageIcon,
  "📝": FileText,
  "🪄": Wand2,
  "📦": Package,
  "⚡": Zap,
  "🎭": Layers,
};

const getIconComponent = (icon?: string) => {
  if (!icon) return Package;
  return iconMap[icon] || Package;
};

export const Header = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { getFavoriteCount } = useFavorites();

  useEffect(() => {
    fetchCategories();

    // Listen for category updates from admin panel
    const handleCategoriesUpdate = () => {
      fetchCategories();
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
    };
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCategoriesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setCategoriesOpen(false);
    }, 150);
  };

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
            <Link to="/urunler" className="px-5 py-2.5 text-base font-bold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200">
              Ürünler
            </Link>
            
            {/* Kategoriler Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="px-5 py-2.5 text-base font-bold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 flex items-center gap-1"
              >
                Kategoriler
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {categoriesOpen && (
                <div
                  className="absolute top-full left-0 pt-1 w-72 z-50"
                >
                  <div className="bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-2">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <Link
                            key={category.id}
                            to={`/kategori/${category.slug}`}
                            className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 group"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                              <IconComponent className="h-4 w-4" strokeWidth={2.5} />
                            </div>
                            <span>{category.name}</span>
                          </Link>
                        );
                      })}
                      {categories.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          Kategori bulunamadı
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border bg-muted/30">
                      <Link
                        to="/kategoriler"
                        className="block px-4 py-3.5 text-sm font-black text-primary hover:bg-primary/5 text-center transition-all duration-200"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        Tüm Kategoriler →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/blog" className="px-5 py-2.5 text-base font-bold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200">
              Blog
            </Link>

            <Link to="/favoriler" className="px-5 py-2.5 text-base font-bold text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoriler
              {getFavoriteCount() > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {getFavoriteCount()}
                </span>
              )}
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
