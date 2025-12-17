import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteProducts();
  }, [favorites]);

  const fetchFavoriteProducts = async () => {
    setLoading(true);
    
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .in("id", favorites);

    if (data) {
      // Sort products to match favorites order
      const sortedProducts = favorites
        .map(id => data.find(p => p.id === id))
        .filter(Boolean);
      setProducts(sortedProducts);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Favorilerim – Dijitalstok</title>
        <meta
          name="description"
          content="Dijitalstok üzerinde favorilerime eklediğim mockup, şablon ve dijital ürünleri görüntüleyin."
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
              <Heart className="h-10 w-10 text-red-500" fill="currentColor" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">
              Favorilerim
            </h1>
            <p className="text-lg text-muted-foreground">
              Beğendiğim {favorites.length} ürün
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && favorites.length === 0 && (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Henüz favori eklemedin
              </h2>
              <p className="text-muted-foreground mb-8">
                Beğendiğin ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsin.
              </p>
              <Link to="/urunler">
                <Button size="lg" className="rounded-full">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Ürünlere Göz At
                </Button>
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      </main>
    </>
  );
}
