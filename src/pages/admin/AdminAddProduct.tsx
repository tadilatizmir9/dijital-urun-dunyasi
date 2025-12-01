import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category_id: "",
    tags: "",
    affiliate_url: "",
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün yüklenemedi.",
      });
      navigate("/admin/urunler");
      return;
    }

    if (data) {
      setFormData({
        title: data.title,
        description: data.description || "",
        image_url: data.image_url || "",
        category_id: data.category_id || "",
        tags: data.tags ? data.tags.join(", ") : "",
        affiliate_url: data.affiliate_url,
      });
    }
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
      .replace(/(^-|-$)/g, "")
      + "-" + Math.random().toString(36).substring(2, 7);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        // Update product
        const { error: productError } = await supabase
          .from("products")
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            category_id: formData.category_id || null,
            tags: formData.tags
              ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
            affiliate_url: formData.affiliate_url,
          })
          .eq("id", id);

        if (productError) throw productError;

        // Update redirect target_url
        const { error: redirectError } = await supabase
          .from("redirects")
          .update({ target_url: formData.affiliate_url })
          .eq("product_id", id);

        if (redirectError) throw redirectError;

        toast({
          title: "Başarılı",
          description: "Ürün güncellendi.",
        });
      } else {
        // Insert product
        const { data: product, error: productError } = await supabase
          .from("products")
          .insert({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            category_id: formData.category_id || null,
            tags: formData.tags
              ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
            affiliate_url: formData.affiliate_url,
          })
          .select()
          .single();

        if (productError) throw productError;

        // Insert redirect
        const slug = generateSlug(formData.title);
        const { error: redirectError } = await supabase.from("redirects").insert({
          product_id: product.id,
          slug: slug,
          target_url: formData.affiliate_url,
          click_count: 0,
        });

        if (redirectError) throw redirectError;

        toast({
          title: "Başarılı",
          description: "Ürün eklendi.",
        });
      }

      navigate("/admin/urunler");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: isEditMode ? "Ürün güncellenemedi." : "Ürün eklenemedi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/urunler")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Ürün bilgilerini güncelleyin" : "Yeni bir ürün oluşturun"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Başlık *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Görsel URL</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="mockup, template, free"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliate_url">Affiliate URL *</Label>
          <Input
            id="affiliate_url"
            type="url"
            value={formData.affiliate_url}
            onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (isEditMode ? "Güncelleniyor..." : "Ekleniyor...") : (isEditMode ? "Ürünü Güncelle" : "Ürün Ekle")}
        </Button>
      </form>
    </div>
  );
}
