import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SimilarProducts } from "@/components/products/SimilarProducts";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [redirect, setRedirect] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data: productData } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .single();

    if (productData) {
      setProduct(productData);

      // Fetch redirect info
      const { data: redirectData } = await supabase
        .from("redirects")
        .select("slug")
        .eq("product_id", id)
        .single();

      if (redirectData) {
        setRedirect(redirectData);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Ürün bulunamadı.</p>
        <Link to="/urunler">
          <Button variant="outline" className="rounded-full">
            Ürünlere Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.title} – Dijitalstok</title>
        <meta
          name="description"
          content={product.description?.substring(0, 150) || product.title}
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link to="/urunler">
            <Button variant="ghost" className="mb-8 rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-8xl">📦</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Category */}
              {product.categories && (
                <Link to={`/kategori/${product.categories.slug}`}>
                  <Badge variant="secondary" className="rounded-full">
                    {product.categories.name}
                  </Badge>
                </Link>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-foreground">{product.title}</h1>

              {/* Description */}
              {product.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

            {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-3">Etiketler</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="pt-4">
                {redirect ? (
                  <Link to={`/go/${redirect.slug}`}>
                    <Button size="lg" className="w-full rounded-full text-lg h-14">
                      Orijinal Sitede Gör / İndir
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full rounded-full text-lg h-14">
                      Orijinal Sitede Gör / İndir
                      <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Benzer Ürünler */}
          <SimilarProducts
            currentProductId={product.id}
            categoryId={product.category_id}
            tags={product.tags}
          />
        </div>
      </main>
    </>
  );
}
