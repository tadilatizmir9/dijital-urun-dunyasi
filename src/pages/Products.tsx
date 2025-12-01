import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters, FilterState } from "@/components/filters/ProductFilters";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    tags: [],
    sortBy: "newest",
  });
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    // URL'den filtreleri yükle
    const categoryFromUrl = searchParams.get("category");
    const tagsFromUrl = searchParams.getAll("tag");
    const sortFromUrl = searchParams.get("sort") || "newest";

    setFilters({
      categoryId: categoryFromUrl,
      tags: tagsFromUrl,
      sortBy: sortFromUrl,
    });
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, filters);
  }, [filters]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, filters);
    }
  }, [page]);

  const fetchProducts = async (currentPage: number, currentFilters: FilterState) => {
    setLoading(true);
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("products")
      .select("*, categories(name)");

    // Kategori filtresi
    if (currentFilters.categoryId) {
      query = query.eq("category_id", currentFilters.categoryId);
    }

    // Sıralama
    switch (currentFilters.sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "az":
        query = query.order("title", { ascending: true });
        break;
      case "za":
        query = query.order("title", { ascending: false });
        break;
      default: // newest
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(from, to);

    const { data, error } = await query;

    if (data) {
      let filteredData = data;

      // Tag filtresi (client-side çünkü array contains karmaşık)
      if (currentFilters.tags.length > 0) {
        filteredData = data.filter((product) => {
          if (!product.tags) return false;
          return currentFilters.tags.some((tag) => product.tags.includes(tag));
        });
      }

      setProducts((prev) => (currentPage === 1 ? filteredData : [...prev, ...filteredData]));
      setHasMore(filteredData.length === ITEMS_PER_PAGE);
    }
    setLoading(false);

    // URL'yi güncelle
    updateURL(currentFilters);
  };

  const updateURL = (currentFilters: FilterState) => {
    const params = new URLSearchParams();
    if (currentFilters.categoryId) params.set("category", currentFilters.categoryId);
    if (currentFilters.sortBy !== "newest") params.set("sort", currentFilters.sortBy);
    currentFilters.tags.forEach((tag) => params.append("tag", tag));
    setSearchParams(params);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Helmet>
        <title>Tüm dijital ürünler – Dijitalstok</title>
        <meta
          name="description"
          content="Mockup, şablon, preset, icon pack ve daha fazlasını içeren tüm dijital ürünleri Dijitalstok üzerinde keşfedin."
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Tüm Ürünler</h1>
            <p className="text-lg text-muted-foreground">
              En kaliteli dijital ürünleri keşfedin
            </p>
          </div>

          {/* Filtreleme */}
          <ProductFilters onFilterChange={handleFilterChange} />

          {loading && page === 1 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {filters.categoryId || filters.tags.length > 0
                  ? "Seçilen filtrelere uygun ürün bulunamadı."
                  : "Henüz ürün eklenmemiş."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
                    className="rounded-full bg-purple hover:bg-purple/90"
                  >
                    {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
