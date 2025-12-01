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
import newsletterImage from "@/assets/newsletter-hero.png";

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
        <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0 gradient-mesh pointer-events-none" />
          
          <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-10 animate-fade-in-up">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                  İçerik üreticiler için<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-secondary">seçilmiş premium içerikler</span>
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                  Mockup, şablon ve dijital stok içerikleri saniyeler içinde keşfet. 
                  <span className="text-foreground font-bold"> En kaliteli kaynaklar, tek yerde.</span>
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-300" />
                  <div className="relative flex items-center bg-card rounded-full border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-xl">
                    <Search className="absolute left-6 h-6 w-6 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Mockup, şablon, preset ara…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-16 pl-16 pr-32 rounded-full text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="absolute right-2 rounded-full gradient-primary hover:shadow-glow transition-all duration-300"
                    >
                      Ara
                    </Button>
                  </div>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Dijital Ürün</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Kategori</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Ücretsiz Erişim</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-20 sm:py-28 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">Popüler Kategoriler</h2>
              <p className="text-xl text-muted-foreground">Aradığın her şey burada</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <section className="py-20 sm:py-28 bg-gradient-to-b from-card to-background">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">Öne Çıkan Ürünler</h2>
                <p className="text-lg text-muted-foreground">En çok tercih edilen dijital içerikler</p>
              </div>
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
        <section className="py-20 sm:py-28">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-12 sm:p-16 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className="space-y-6 text-white">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                    Haftanın En İyi Dijital Ürünleri
                  </h2>
                  <p className="text-xl text-white/95 leading-relaxed">
                    Ücretsiz mail olarak almak ister misin? Hemen abone ol, hiçbir fırsatı kaçırma!
                  </p>
                  <form className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Input
                      type="email"
                      placeholder="E-posta adresin"
                      className="h-14 rounded-full bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm text-lg focus:bg-white/30 transition-colors"
                    />
                    <Button 
                      type="submit" 
                      size="lg" 
                      variant="secondary" 
                      className="rounded-full h-14 px-8 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    >
                      Abone Ol
                    </Button>
                  </form>
                </div>
                
                {/* Image */}
                <div className="hidden lg:flex justify-center">
                  <img
                    src={newsletterImage}
                    alt="Newsletter"
                    className="w-full max-w-md object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
