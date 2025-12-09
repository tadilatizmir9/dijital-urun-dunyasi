import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BlogCard } from "@/components/blog/BlogCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get("kategori") || "";
  const selectedTag = searchParams.get("etiket") || "";

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory, selectedTag]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*, blog_categories(name, slug)")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      // Find category by slug
      const { data: catData } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("slug", selectedCategory)
        .maybeSingle();
      if (catData) {
        query = query.eq("category_id", catData.id);
      }
    }

    if (selectedTag) {
      query = query.contains("tags", [selectedTag]);
    }

    const { data } = await query;

    if (data) {
      setPosts(data);
      // Extract unique tags from all posts
      const tags = new Set<string>();
      data.forEach((post) => {
        if (post.tags) {
          post.tags.forEach((tag: string) => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags).sort());
    }
    setLoading(false);
  };

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set("kategori", slug);
    } else {
      params.delete("kategori");
    }
    setSearchParams(params);
  };

  const handleTagFilter = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    if (tag) {
      params.set("etiket", tag);
    } else {
      params.delete("etiket");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>Blog – Dijitalstok</title>
        <meta
          name="description"
          content="Dijital ürünler, tasarım kaynakları ve içerik üretimi üzerine yazılar – Dijitalstok Blog."
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Blog</h1>
            <p className="text-lg text-muted-foreground">
              Dijital içerikler ve tasarım hakkında yazılar
            </p>
          </header>

          {/* Filters */}
          {(categories.length > 0 || allTags.length > 0) && (
            <div className="mb-8 space-y-4">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-muted-foreground mr-2">
                    Kategoriler:
                  </span>
                  <Button
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleCategoryFilter("")}
                  >
                    Tümü
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.slug ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleCategoryFilter(cat.slug)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-muted-foreground mr-2">
                    Etiketler:
                  </span>
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleTagFilter(selectedTag === tag ? "" : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Clear filters */}
              {(selectedCategory || selectedTag) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedCategory || selectedTag
                  ? "Bu filtrelere uygun yazı bulunamadı."
                  : "Henüz blog yazısı yok."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  cover_image={post.cover_image}
                  created_at={post.created_at}
                  category={post.blog_categories?.name}
                  tags={post.tags}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
