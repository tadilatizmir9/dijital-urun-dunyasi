import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";

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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchParams({ q: query });
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
          {/* Search Bar with Autocomplete */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
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
