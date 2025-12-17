import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters, FilterState } from "@/components/filters/ProductFilters";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export default function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    tags: [],
    sortBy: "newest",
  });

  // Kategori bilgisini sadece slug değiştiğinde çek
  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;

      setLoading(true);
      const { data: categoryData } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      setCategory(categoryData);
      setLoading(false);
    };

    fetchCategory();
  }, [slug]);

  // Alt kategorileri kategori yüklendiğinde çek
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (category?.id) {
        const { data: subcategoriesData } = await supabase
          .from("subcategories")
          .select("id, name, slug")
          .eq("parent_category_id", category.id)
          .order("name");
        if (subcategoriesData) setSubcategories(subcategoriesData);
      } else {
        setSubcategories([]);
      }
      // Reset selected subcategory when category changes
      setSelectedSubcategoryId(null);
    };

    fetchSubcategories();
  }, [category]);

  // Ürünleri kategori, alt kategori veya filtreler değiştiğinde çek
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;

      setLoading(true);

      let query = supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", category.id);

      // Alt kategori filtresi
      if (selectedSubcategoryId) {
        query = query.eq("subcategory_id", selectedSubcategoryId);
      }

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

      setLoading(false);
    };

    fetchProducts();
  }, [category, selectedSubcategoryId, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    // Aynı filtreler tekrar geliyorsa state'i güncelleyip yeniden fetch etme
    setFilters((prev) => {
      const tagsEqual =
        prev.tags.length === newFilters.tags.length &&
        prev.tags.every((tag, idx) => tag === newFilters.tags[idx]);

      if (prev.sortBy === newFilters.sortBy && tagsEqual) {
        return prev;
      }

      return newFilters;
    });
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
        <title>{category.name} – Dijital ürünler – Dijitalstok</title>
        <meta
          name="description"
          content={`Dijitalstok üzerinde ${category.name} kategorisindeki seçilmiş dijital ürünleri keşfedin.`}
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-5xl mb-4" aria-hidden="true">{category.icon || "📁"}</div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{category.name}</h1>
            <h2 className="text-lg text-muted-foreground font-normal">
              {products.length} ürün bulundu
            </h2>
          </div>

          {/* Alt Kategori Filtreleri */}
          {subcategories.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-2">
                  Alt Kategoriler:
                </span>
                <Button
                  variant={!selectedSubcategoryId ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedSubcategoryId(null)}
                >
                  Tümü
                </Button>
                {subcategories.map((subcategory) => (
                  <Button
                    key={subcategory.id}
                    variant={selectedSubcategoryId === subcategory.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedSubcategoryId(subcategory.id)}
                  >
                    {subcategory.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
