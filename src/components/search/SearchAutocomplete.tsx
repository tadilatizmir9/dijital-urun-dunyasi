import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Package, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

interface ProductSuggestion {
  id: string;
  title: string;
  image_url?: string;
}

interface CategorySuggestion {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export const SearchAutocomplete = ({ value, onChange, onSearch }: SearchAutocompleteProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim() || value.length < 2) {
      setProducts([]);
      setCategories([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const fetchSuggestions = async (searchTerm: string) => {
    console.log('Fetching suggestions for:', searchTerm);
    setLoading(true);
    setIsOpen(true);

    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, title, image_url")
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(5);

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug, icon")
      .ilike("name", `%${searchTerm}%`)
      .limit(3);

    console.log('Products found:', productsData?.length || 0, productsError);
    console.log('Categories found:', categoriesData?.length || 0, categoriesError);

    if (productsData) setProducts(productsData);
    if (categoriesData) setCategories(categoriesData);
    setLoading(false);
    
    console.log('Dropdown isOpen:', true, 'Total results:', (productsData?.length || 0) + (categoriesData?.length || 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      setIsOpen(false);
      onSearch(value);
    }
  };

  const handleProductClick = (productId: string) => {
    setIsOpen(false);
    navigate(`/urun/${productId}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    setIsOpen(false);
    navigate(`/kategori/${categorySlug}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const showSuggestions = isOpen && (products.length > 0 || categories.length > 0 || loading);

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="En az 2 karakter yazın..."
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              console.log('Input focused, value length:', value.trim().length);
              if (value.trim().length >= 2 && (products.length > 0 || categories.length > 0)) {
                setIsOpen(true);
              }
            }}
            className="h-14 pl-14 pr-4 rounded-full text-base border-2"
            autoComplete="off"
          />
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border-2 border-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in">
          <div className="max-h-[400px] overflow-y-auto">
            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="p-2 border-b border-border">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Kategoriler
                </div>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-foreground">{category.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Products Section */}
            {products.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ürünler
                </div>
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted rounded-xl transition-all duration-200 group"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium text-foreground line-clamp-1">{product.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && products.length === 0 && categories.length === 0 && (
              <div className="p-6 text-center bg-white dark:bg-gray-900">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                <p className="text-sm text-muted-foreground">Aranıyor...</p>
              </div>
            )}
            
            {/* No Results */}
            {!loading && products.length === 0 && categories.length === 0 && isOpen && value.length >= 2 && (
              <div className="p-6 text-center bg-white dark:bg-gray-900">
                <p className="text-sm text-muted-foreground">Sonuç bulunamadı</p>
              </div>
            )}
          </div>

          {/* View All Results Footer */}
          {(products.length > 0 || categories.length > 0) && (
            <div className="border-t border-border bg-gray-50 dark:bg-gray-800 p-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSearch(value);
                }}
                className="w-full text-center text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Tüm sonuçları görüntüle →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
