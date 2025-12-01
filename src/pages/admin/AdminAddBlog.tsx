import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function AdminAddBlog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    cover_image: "",
    excerpt: "",
    content: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const stripMarkdown = (markdown: string) => {
    return markdown
      .replace(/[#*`~_>\[\]()]/g, "")
      .replace(/\n+/g, " ")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleContentChange = (value: string) => {
    setFormData({
      ...formData,
      content: value,
      // Excerpt otomatik oluştur (ilk 150 karakter, markdown olmadan)
      excerpt: stripMarkdown(value).substring(0, 150),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("posts").insert({
        title: formData.title,
        slug: formData.slug,
        cover_image: formData.cover_image,
        excerpt: formData.excerpt,
        content: formData.content,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Blog yazısı eklendi.",
      });

      navigate("/admin/blog");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Blog yazısı eklenemedi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/blog")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Yeni Blog Yazısı</h1>
          <p className="text-muted-foreground">Markdown formatında yeni bir blog yazısı oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              URL'de görünecek: /blog/{formData.slug || "slug"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_image">Kapak Görseli URL</Label>
          <Input
            id="cover_image"
            type="url"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Özet (otomatik oluşturulur)</Label>
          <Input
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="İçerikten otomatik oluşturulacak..."
          />
          <p className="text-xs text-muted-foreground">
            İçeriğin ilk 150 karakteri otomatik olarak özet olarak kullanılır.
          </p>
        </div>

        <div className="space-y-2">
          <Label>İçerik * (Markdown)</Label>
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Düzenle</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Önizleme
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <Textarea
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                placeholder="# Başlık&#10;&#10;## Alt Başlık&#10;&#10;Normal metin...&#10;&#10;**Kalın metin**&#10;&#10;*İtalik metin*&#10;&#10;- Liste öğesi 1&#10;- Liste öğesi 2&#10;&#10;```javascript&#10;// Kod örneği&#10;console.log('Hello');&#10;```"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Markdown formatında yazın. Önizleme sekmesinden sonucu görüntüleyebilirsiniz.
              </p>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="min-h-[500px] border border-border rounded-lg p-6 bg-card">
                {formData.content ? (
                  <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-a:text-purple prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-purple prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-card prose-pre:border prose-pre:border-border prose-img:rounded-2xl">
                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">
                    Önizleme için içerik yazın...
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-purple hover:bg-purple/90"
        >
          {loading ? "Ekleniyor..." : "Blog Yazısı Ekle"}
        </Button>
      </form>
    </div>
  );
}
