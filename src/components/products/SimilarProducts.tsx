import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "./ProductCard";

interface SimilarProductsProps {
  currentProductId: string;
  categoryId?: string;
  tags?: string[];
}

export const SimilarProducts = ({
  currentProductId,
  categoryId,
  tags,
}: SimilarProductsProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarProducts();
  }, [currentProductId, categoryId, tags]);

  const fetchSimilarProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*, categories(name)")
        .neq("id", currentProductId)
        .limit(4);

      // Önce aynı kategorideki ürünleri dene
      if (categoryId) {
        const { data: categoryProducts } = await query.eq("category_id", categoryId);
        
        if (categoryProducts && categoryProducts.length >= 4) {
          setProducts(categoryProducts);
          setLoading(false);
          return;
        }

        // Kategori ürünleri yeterli değilse, tag eşleşmesine bak
        if (tags && tags.length > 0) {
          const { data: tagProducts } = await supabase
            .from("products")
            .select("*, categories(name)")
            .neq("id", currentProductId)
            .limit(4);

          if (tagProducts) {
            // Tag eşleşmesi olan ürünleri filtrele
            const filtered = tagProducts.filter((product) => {
              if (!product.tags) return false;
              return product.tags.some((tag: string) => tags.includes(tag));
            });

            // Kategori ürünleri ile birleştir
            const combined = categoryProducts
              ? [...categoryProducts, ...filtered]
              : filtered;

            // Unique ve limit 4
            const unique = Array.from(
              new Map(combined.map((p) => [p.id, p])).values()
            ).slice(0, 4);

            setProducts(unique);
          } else {
            setProducts(categoryProducts || []);
          }
        } else {
          setProducts(categoryProducts || []);
        }
      } else {
        // Kategori yoksa, sadece tag eşleşmesine bak
        const { data: allProducts } = await supabase
          .from("products")
          .select("*, categories(name)")
          .neq("id", currentProductId)
          .limit(8);

        if (allProducts && tags && tags.length > 0) {
          const filtered = allProducts
            .filter((product) => {
              if (!product.tags) return false;
              return product.tags.some((tag: string) => tags.includes(tag));
            })
            .slice(0, 4);

          setProducts(filtered);
        } else {
          setProducts(allProducts?.slice(0, 4) || []);
        }
      }
    } catch (error) {
      console.error("Error fetching similar products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <p className="text-center text-muted-foreground">Benzer ürünler yükleniyor...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12">
        <p className="text-center text-muted-foreground">Benzer ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="py-12 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">Benzer Ürünler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
};
