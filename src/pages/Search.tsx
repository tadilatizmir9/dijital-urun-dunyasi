import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" için arama sonuçları – Dijitalstok` : "Arama – Dijitalstok"}</title>
        <meta 
          name="description" 
          content={query ? `Dijitalstok üzerinde "${query}" araması için bulunan mockup, şablon ve diğer dijital ürünleri görüntüleyin.` : "Dijitalstok üzerinde mockup, şablon ve dijital ürünleri arayın."} 
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Mockup, şablon, preset ara…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-14 pr-4 rounded-full text-base border-2"
                />
              </div>
            </form>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aranıyor...</p>
            </div>
          ) : (
            <>
              {query && (
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground">
                    "{query}" için {products.length} sonuç bulundu
                  </h1>
                </div>
              )}

              {products.length === 0 && query ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-lg text-muted-foreground">
                    Bu arama için ürün bulamadık.
                  </p>
                  <p className="text-muted-foreground">
                    Farklı anahtar kelimeler deneyebilirsin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      description={product.description}
                      image_url={product.image_url}
                      tags={product.tags}
                      category={product.categories?.name}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
