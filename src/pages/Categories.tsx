import { useState, useEffect } from "react";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Kategoriler – Dijitalstok</title>
        <meta name="description" content="Tüm dijital ürün kategorilerini keşfedin." />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Kategoriler</h1>
            <p className="text-lg text-muted-foreground">
              İlgilendiğin kategoriye göz at
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz kategori eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                  description={`${category.name} kategorisindeki tüm ürünleri keşfet`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
