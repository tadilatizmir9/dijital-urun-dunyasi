import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

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

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || "";
    setFormData({
      ...formData,
      content: newContent,
      // Excerpt otomatik oluştur (ilk 150 karakter, markdown olmadan)
      excerpt: stripMarkdown(newContent).substring(0, 150),
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
          <p className="text-muted-foreground">Markdown editör ile yeni bir blog yazısı oluşturun</p>
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

        <div className="space-y-2" data-color-mode="light">
          <Label>İçerik * (Markdown)</Label>
          <MDEditor
            value={formData.content}
            onChange={handleContentChange}
            height={500}
            preview="live"
            highlightEnable={true}
          />
          <p className="text-xs text-muted-foreground">
            Markdown formatında içerik yazabilirsiniz. Sağ tarafta önizleme görünecektir.
          </p>
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
