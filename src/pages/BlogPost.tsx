import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post?.title || "")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent((post?.title || "") + " " + currentUrl)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({ title: "Link kopyalandı!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Link kopyalanamadı", variant: "destructive" });
    }
  };

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
      fetchRelatedPosts(data);
    }
    setLoading(false);
  };

  const fetchRelatedPosts = async (currentPost: any) => {
    // Fetch posts from same category or with overlapping tags
    let query = supabase
      .from("posts")
      .select("id, title, slug, cover_image, excerpt, created_at, blog_categories(name, slug)")
      .eq("status", "published")
      .neq("id", currentPost.id)
      .limit(3);

    if (currentPost.category_id) {
      query = query.eq("category_id", currentPost.category_id);
    }

    const { data } = await query.order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setRelatedPosts(data);
    } else if (currentPost.tags && currentPost.tags.length > 0) {
      // Fallback: fetch posts with overlapping tags
      const { data: tagPosts } = await supabase
        .from("posts")
        .select("id, title, slug, cover_image, excerpt, created_at, blog_categories(name, slug)")
        .eq("status", "published")
        .neq("id", currentPost.id)
        .overlaps("tags", currentPost.tags)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (tagPosts) {
        setRelatedPosts(tagPosts);
      }
    }
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

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-sm text-muted-foreground mr-2 flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Paylaş:
            </span>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Twitter'da Paylaş"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-[#1877F2] hover:text-white transition-colors"
              title="Facebook'ta Paylaş"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-[#0A66C2] hover:text-white transition-colors"
              title="LinkedIn'de Paylaş"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-muted hover:bg-[#25D366] hover:text-white transition-colors"
              title="WhatsApp'ta Paylaş"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors"
              title="Linki Kopyala"
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </button>
          </div>

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

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">İlgili Yazılar</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
                      {relatedPost.cover_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={relatedPost.cover_image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        {relatedPost.blog_categories?.name && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {relatedPost.blog_categories.name}
                          </Badge>
                        )}
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <time className="text-xs text-muted-foreground mt-2 block">
                          {new Date(relatedPost.created_at).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
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
