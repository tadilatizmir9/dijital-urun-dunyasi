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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import slugify from "@/lib/slugify";

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [similarProductDialog, setSimilarProductDialog] = useState<{
    open: boolean;
    existingTitle: string | null;
  }>({ open: false, existingTitle: null });
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    image_url: "",
    image_url_2: "",
    category_id: "",
    subcategory_id: "",
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

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const { data } = await supabase
      .from("subcategories")
      .select("*")
      .eq("parent_category_id", categoryId)
      .order("name");
    if (data) setSubcategories(data);
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
        slug: (data as any).slug || "",
        description: data.description || "",
        image_url: data.image_url || "",
        image_url_2: data.image_url_2 || "",
        category_id: data.category_id || "",
        subcategory_id: data.subcategory_id || "",
        tags: data.tags ? data.tags.join(", ") : "",
        affiliate_url: data.affiliate_url,
      });
      setSlugManuallyEdited(false); // Reset on edit mode load
      
      // Alt kategorileri yükle
      if (data.category_id) {
        fetchSubcategories(data.category_id);
      }
    }
  };

  const normalizeTitle = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " "); // Replace multiple spaces with single space
  };

  const checkSimilarProducts = async (title: string): Promise<string | null> => {
    const normalizedTitle = normalizeTitle(title);
    if (!normalizedTitle || normalizedTitle.length < 2) {
      return null;
    }

    // Search for products where title contains the normalized search term (case-insensitive)
    // Using ILIKE with contains match: '%term%'
    const { data, error } = await supabase
      .from("products")
      .select("title")
      .ilike("title", `%${normalizedTitle}%`)
      .limit(5);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Check if any existing product's normalized title is similar
    // (bidirectional check: new title contains existing OR existing contains new)
    for (const product of data) {
      const existingNormalized = normalizeTitle(product.title);
      // Check if either title contains the other (bidirectional similarity)
      if (
        existingNormalized.includes(normalizedTitle) ||
        normalizedTitle.includes(existingNormalized) ||
        existingNormalized === normalizedTitle
      ) {
        return product.title;
      }
    }

    return null;
  };

  const handleTitleChange = (title: string) => {
    const newFormData = { ...formData, title };
    
    // Auto-generate slug if user hasn't manually edited it and title exists
    if (!slugManuallyEdited && title.trim()) {
      newFormData.slug = slugify(title);
    }
    
    setFormData(newFormData);
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setFormData({ ...formData, slug: slug.trim() });
  };

  const performInsert = async () => {
    setLoading(true);

    try {
      // Ensure slug exists (generate from title if empty)
      const finalSlug = formData.slug?.trim() || slugify(formData.title);
      
      if (!finalSlug) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Slug oluşturulamadı. Lütfen başlık girin.",
        });
        setLoading(false);
        return;
      }

      // Insert product with slug
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          title: formData.title,
          slug: finalSlug,
          description: formData.description,
          image_url: formData.image_url,
          image_url_2: formData.image_url_2,
          category_id: formData.category_id || null,
          subcategory_id: formData.subcategory_id || null,
          tags: formData.tags
            ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          affiliate_url: formData.affiliate_url,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert redirect (use same slug for redirects table)
      const { error: redirectError } = await supabase.from("redirects").insert({
        product_id: product.id,
        slug: finalSlug,
        target_url: formData.affiliate_url,
        click_count: 0,
      });

      if (redirectError) throw redirectError;

      toast({
        title: "Başarılı",
        description: "Ürün eklendi.",
      });

      navigate("/admin/urunler");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün eklenemedi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir başlık girin.",
      });
      return;
    }

    if (isEditMode) {
      // Update product - no duplicate check needed
      setLoading(true);

      try {
        // Ensure slug exists (use existing, user input, or generate from title)
        const finalSlug = formData.slug?.trim() || slugify(formData.title);
        
        if (!finalSlug) {
          toast({
            variant: "destructive",
            title: "Hata",
            description: "Slug oluşturulamadı. Lütfen geçerli bir başlık girin.",
          });
          setLoading(false);
          return;
        }

        const { error: productError } = await supabase
          .from("products")
          .update({
            title: formData.title,
            slug: finalSlug,
            description: formData.description,
            image_url: formData.image_url,
            image_url_2: formData.image_url_2,
            category_id: formData.category_id || null,
            subcategory_id: formData.subcategory_id || null,
            tags: formData.tags
              ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
            affiliate_url: formData.affiliate_url,
          })
          .eq("id", id);

        if (productError) throw productError;

        // Update redirect slug and target_url
        const { error: redirectError } = await supabase
          .from("redirects")
          .update({ 
            slug: finalSlug,
            target_url: formData.affiliate_url 
          })
          .eq("product_id", id);

        if (redirectError) throw redirectError;

        toast({
          title: "Başarılı",
          description: "Ürün güncellendi.",
        });

        navigate("/admin/urunler");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ürün güncellenemedi.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Insert mode: validate slug
      const finalSlug = formData.slug?.trim() || slugify(formData.title);
      if (!finalSlug) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Slug oluşturulamadı. Lütfen geçerli bir başlık girin.",
        });
        return;
      }

      // Check for similar products first
      const similarProductTitle = await checkSimilarProducts(formData.title);

      if (similarProductTitle) {
        // Show confirmation dialog
        setSimilarProductDialog({
          open: true,
          existingTitle: similarProductTitle,
        });
      } else {
        // No similar products found, proceed directly
        performInsert();
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? "Ürün Düzenle" : "Yeni Ürün Ekle"} – Admin – Dijitalstok</title>
      </Helmet>

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
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (otomatik oluşturulur, opsiyonel)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="URL'de görünecek: /urun/{slug}"
          />
          <p className="text-xs text-muted-foreground">
            Başlık değiştiğinde otomatik oluşturulur. İsterseniz manuel olarak düzenleyebilirsiniz.
          </p>
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
          <Label htmlFor="image_url_2">İkinci Görsel URL (Opsiyonel)</Label>
          <Input
            id="image_url_2"
            type="url"
            value={formData.image_url_2}
            onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => {
              setFormData({ ...formData, category_id: value, subcategory_id: "" });
              fetchSubcategories(value);
            }}
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

        {/* Alt Kategori Seçimi */}
        {formData.category_id && subcategories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="subcategory">Alt Kategori (Opsiyonel)</Label>
            <Select
              value={formData.subcategory_id}
              onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alt kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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

      {/* Similar Product Confirmation Dialog */}
      <AlertDialog open={similarProductDialog.open} onOpenChange={(open) => {
        if (!open) {
          setSimilarProductDialog({ open: false, existingTitle: null });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benzer Ürün Uyarısı</AlertDialogTitle>
            <AlertDialogDescription>
              Benzer bir ürün var: <strong>{similarProductDialog.existingTitle}</strong> | Devam etmek ister misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSimilarProductDialog({ open: false, existingTitle: null })}>
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSimilarProductDialog({ open: false, existingTitle: null });
                performInsert();
              }}
            >
              Evet, devam et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}
