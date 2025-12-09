import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminEditBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    cover_image: "",
    excerpt: "",
    content: "",
    meta_title: "",
    meta_description: "",
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Blog yazısı bulunamadı.",
      });
      navigate("/admin/blog");
      return;
    }

    setFormData({
      title: data.title || "",
      slug: data.slug || "",
      cover_image: data.cover_image || "",
      excerpt: data.excerpt || "",
      content: data.content || "",
      meta_title: data.meta_title || "",
      meta_description: data.meta_description || "",
      status: (data.status as "draft" | "published") || "draft",
    });
    setLoading(false);
  };

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

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleContentChange = (value: string) => {
    const plainText = stripHtml(value);
    setFormData({
      ...formData,
      content: value,
      excerpt: formData.excerpt || plainText.substring(0, 150),
      meta_description: formData.meta_description || plainText.substring(0, 160),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: formData.title,
          slug: formData.slug,
          cover_image: formData.cover_image,
          excerpt: formData.excerpt,
          content: formData.content,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          status: formData.status,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Blog yazısı güncellendi.",
      });

      navigate("/admin/blog");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Blog yazısı güncellenemedi.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog Düzenle – Admin – Dijitalstok</title>
      </Helmet>

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
            <h1 className="text-3xl font-bold text-foreground">
              Blog Yazısını Düzenle
            </h1>
            <p className="text-muted-foreground">
              Mevcut blog yazısını güncelleyin
            </p>
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
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
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
              onChange={(e) =>
                setFormData({ ...formData, cover_image: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Özet</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              placeholder="Blog yazısının kısa özeti..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Yayın Durumu</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "draft" | "published") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="published">Yayında</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Taslak yazılar sadece admin panelinde görünür.
            </p>
          </div>

          {/* SEO / Meta Alanları */}
          <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-primary">SEO</span> Ayarları
            </h3>

            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Başlık</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({ ...formData, meta_title: e.target.value })
                }
                placeholder="Sayfa başlığından otomatik oluşturulur"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_title.length}/60 karakter (önerilen max 60)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Açıklama</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                placeholder="İçerikten otomatik oluşturulur"
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_description.length}/160 karakter (önerilen max
                160)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>İçerik *</Label>
            <RichTextEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Blog içeriğinizi buraya yazın..."
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </form>
      </div>
    </>
  );
}
