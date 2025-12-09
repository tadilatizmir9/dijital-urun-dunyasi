import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, blog_categories(name, slug)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (data) {
      setPost(data);
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

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Blog yazısı bulunamadı.</p>
        <Link to="/blog">
          <Button variant="outline" className="rounded-full">
            Blog'a Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} – Dijitalstok Blog</title>
        <meta
          name="description"
          content={post.meta_description || post.excerpt || post.title}
        />
      </Helmet>

      <main className="min-h-screen bg-background py-12">
        <article className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link to="/blog">
            <Button variant="ghost" className="mb-8 rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog'a Dön
            </Button>
          </Link>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="aspect-video rounded-3xl overflow-hidden mb-8">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta - Category & Date */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {post.blog_categories?.name && (
              <Link to={`/blog?kategori=${post.blog_categories.slug}`}>
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {post.blog_categories.name}
                </Badge>
              </Link>
            )}
            <time className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* HTML Content from Rich Text Editor */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-a:text-primary prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || "") }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Etiketler:</span>
                {post.tags.map((tag: string) => (
                  <Link key={tag} to={`/blog?etiket=${tag}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dahili Linkleme - Daha Fazla İçerik Keşfet */}
          <section className="mt-16 pt-8 border-t border-border">
            <div className="bg-muted/50 rounded-2xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Daha Fazla İçerik Keşfet</h2>
              <p className="text-muted-foreground">
                Dijital yaratıcılar için seçilmiş premium içerikleri incelemek ister misin?
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/urunler">
                  <Button size="lg" className="rounded-full">
                    Tüm Ürünleri Görüntüle
                  </Button>
                </Link>
                <Link to="/#kategoriler">
                  <Button size="lg" variant="outline" className="rounded-full">
                    Popüler Kategorilere Göz At
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
