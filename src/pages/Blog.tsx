import { useState, useEffect } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz blog yazısı yok.</p>
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
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
