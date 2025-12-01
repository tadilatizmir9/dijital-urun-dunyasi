import { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      setProducts((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === ITEMS_PER_PAGE);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Tüm Ürünler – Dijitalstok</title>
        <meta
          name="description"
          content="Mockup, şablon, preset ve daha fazlası. Dijital ürün kataloğumuzu keşfedin."
        />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Tüm Ürünler</h1>
            <p className="text-lg text-muted-foreground">
              En kaliteli dijital ürünleri keşfedin
            </p>
          </div>

          {loading && page === 1 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz ürün eklenmemiş.</p>
            </div>
          ) : (
            <>
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

              {hasMore && (
                <div className="mt-12 text-center">
                  <Button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                    size="lg"
                    className="rounded-full"
                  >
                    {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
