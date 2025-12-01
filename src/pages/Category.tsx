import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters, FilterState } from "@/components/filters/ProductFilters";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

export default function Category() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    tags: [],
    sortBy: "newest",
  });

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  useEffect(() => {
    // URL'den filtreleri yükle
    const tagsFromUrl = searchParams.getAll("tag");
    const sortFromUrl = searchParams.get("sort") || "newest";

    setFilters((prev) => ({
      ...prev,
      tags: tagsFromUrl,
      sortBy: sortFromUrl,
    }));
  }, []);

  useEffect(() => {
    if (category) {
      fetchCategoryAndProducts();
    }
  }, [filters]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    // Fetch category
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (categoryData) {
      setCategory(categoryData);

      // Fetch products in this category
      let query = supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", categoryData.id);

      // Sıralama
      switch (filters.sortBy) {
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

      const { data: productsData } = await query;

      if (productsData) {
        let filteredData = productsData;

        // Tag filtresi
        if (filters.tags.length > 0) {
          filteredData = productsData.filter((product) => {
            if (!product.tags) return false;
            return filters.tags.some((tag) => product.tags.includes(tag));
          });
        }

        setProducts(filteredData);
      }

      // URL'yi güncelle
      updateURL(filters);
    }
    setLoading(false);
  };

  const updateURL = (currentFilters: FilterState) => {
    const params = new URLSearchParams();
    if (currentFilters.sortBy !== "newest") params.set("sort", currentFilters.sortBy);
    currentFilters.tags.forEach((tag) => params.append("tag", tag));
    setSearchParams(params);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Kategori bulunamadı.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} – Dijitalstok</title>
        <meta
          name="description"
          content={`${category.name} kategorisindeki tüm dijital ürünleri keşfedin.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-5xl mb-4">{category.icon || "📁"}</div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{category.name}</h1>
            <p className="text-lg text-muted-foreground">
              {products.length} ürün bulundu
            </p>
          </div>

          {/* Filtreleme - kategori zaten belirli olduğu için selectedCategory prop'u gönderiyoruz */}
          <ProductFilters 
            onFilterChange={handleFilterChange} 
            selectedCategory={category.id}
          />

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {filters.tags.length > 0
                  ? "Seçilen filtrelere uygun ürün bulunamadı."
                  : "Bu kategoride henüz ürün yok."}
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
}
