import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .limit(6);
    if (categoriesData) setCategories(categoriesData);

    // Fetch featured products (first 8)
    const { data: featuredData } = await supabase
      .from("products")
      .select("*, categories(name)")
      .limit(8);
    if (featuredData) setFeaturedProducts(featuredData);

    // Fetch new products
    const { data: newData } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false })
      .limit(9);
    if (newData) setNewProducts(newData);

    // Fetch blog posts
    const { data: blogData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
    if (blogData) setBlogPosts(blogData);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/arama?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dijitalstok – Mockup, şablon ve dijital stok içerik kataloğu</title>
        <meta
          name="description"
          content="Dijital yaratıcılar için seçilmiş mockup, şablon ve stok içerikler. Aradığın dijital içeriği saniyeler içinde keşfet."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent py-20 sm:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                Dijital yaratıcılar için seçilmiş<br />
                <span className="text-primary">mockup, şablon ve stok içerikler</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Aradığın dijital içeriği saniyeler içinde keşfet ve orijinal siteden indir.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Mockup, şablon, preset ara…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-14 pr-4 rounded-full text-base border-2 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8">Popüler Kategoriler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                  description={`${category.name} kategorisindeki tüm dijital içerikleri keşfet`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="py-16 sm:py-20 bg-card">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-foreground mb-8">Öne Çıkan Ürünler</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
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
          </section>
        )}

        {/* New Products */}
        {newProducts.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-foreground mb-8">Yeni Eklenenler</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newProducts.map((product) => (
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
          </section>
        )}

        {/* Blog Posts */}
        {blogPosts.length > 0 && (
          <section className="py-16 sm:py-20 bg-card">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-foreground mb-8">Blog'dan Son Yazılar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt}
                    cover_image={post.cover_image}
                    created_at={post.created_at}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-primary p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Haftanın En İyi Dijital Ürünleri
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Ücretsiz mail olarak almak ister misin? Hemen abone ol!
              </p>
              <form className="max-w-md mx-auto flex gap-3">
                <Input
                  type="email"
                  placeholder="E-posta adresin"
                  className="h-12 rounded-full bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button type="submit" size="lg" variant="secondary" className="rounded-full">
                  Abone Ol
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
