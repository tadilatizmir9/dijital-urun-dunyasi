import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { BeehiivSubscribe } from "@/components/BeehiivSubscribe";
import { supabase } from "@/lib/supabaseClient";
import { Seo } from "@/components/Seo";
import Lottie from "lottie-react";
import emailAnimation from "@/assets/email-animation.json";

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
    // Fetch categories that are marked to show on homepage
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("show_on_homepage", true)
      .limit(6);
    if (categoriesData) setCategories(categoriesData);

    // Fetch featured products (marked as featured)
    const { data: featuredData } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("featured", true)
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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/arama?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <Seo
        title="Dijitalstok – Mockup, şablon ve dijital stok içerik kataloğu"
        description="Dijitalstok, mockup, Canva şablonları, presetler, icon setleri ve yaratıcı dijital stok içeriklerini bir arada keşfedebileceğiniz ücretsiz bir katalogdur."
      />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0 gradient-mesh pointer-events-none" />
          
          <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-10 animate-fade-in-up">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                  İçerik üreticiler için<br />
                  <span className="text-primary">seçilmiş</span>{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-purple-900 to-purple-950 dark:from-white dark:via-purple-300 dark:to-purple-400">premium</span>{" "}
                  <span className="text-primary">stoklar</span>
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                  Mockup, şablon ve dijital stok içerikleri saniyeler içinde keşfet. 
                  <span className="text-foreground font-bold"> En kaliteli kaynaklar, tek yerde.</span>
                </p>
              </div>

              {/* Search Bar with Autocomplete */}
              <div className="max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-300" />
                  <div className="relative">
                    <SearchAutocomplete
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSearch={handleSearch}
                    />
                  </div>
                </div>
              </div>

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
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">Popüler Kategoriler</h2>
              <p className="text-xl text-muted-foreground">Aradığın her şey burada</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {featuredProducts.map((product) => (
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
            </div>
          </section>
        )}

        {/* New Products */}
        {newProducts.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-foreground mb-8">Yeni Eklenenler</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {newProducts.map((product) => (
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
            </div>
          </section>
        )}

        {/* Blog Posts */}
        {blogPosts.length > 0 && (
          <section className="py-16 sm:py-20 bg-card">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-foreground mb-8">Blog'dan Son Yazılar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-center">
                {/* Content */}
                <div className="space-y-6 text-white">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                    Haftanın En İyi Dijital Ürünleri
                  </h2>
                  <p className="text-xl text-white/95 leading-relaxed">
                    Ücretsiz mail olarak almak ister misin? Hemen abone ol, hiçbir fırsatı kaçırma!
                  </p>
                  <div className="pt-4">
                    <BeehiivSubscribe />
                  </div>
                </div>
                
                {/* Animation */}
                <div className="hidden lg:flex justify-center">
                  <Lottie
                    animationData={emailAnimation}
                    loop={true}
                    className="w-[21rem] h-[21rem]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
