import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

export default function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    // Fetch category
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (categoryData) {
      setCategory(categoryData);

      // Fetch products in this category
      const { data: productsData } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("category_id", categoryData.id)
        .order("created_at", { ascending: false });

      if (productsData) {
        setProducts(productsData);
      }
    }
    setLoading(false);
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

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Bu kategoride henüz ürün yok.</p>
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
        </div>
      </div>
    </>
  );
}
