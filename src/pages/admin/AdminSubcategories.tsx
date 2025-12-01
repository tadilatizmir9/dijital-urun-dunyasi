import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Pencil, X, Check, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

export default function AdminSubcategories() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", slug: "", icon: "" });
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchSubcategories();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (data) {
      setCategory(data);
    }
  };

  const fetchSubcategories = async () => {
    const { data } = await supabase
      .from("subcategories")
      .select("*")
      .eq("parent_category_id", categoryId)
      .order("name");

    if (data) {
      setSubcategories(data);
    }
  };

  const generateSlug = (name: string) => {
    return name
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

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("subcategories").insert({
        name: formData.name,
        slug: formData.slug,
        icon: formData.icon,
        parent_category_id: categoryId,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Alt kategori eklendi.",
      });

      setFormData({ name: "", slug: "", icon: "" });
      fetchSubcategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Alt kategori eklenemedi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subcategory: any) => {
    setEditingId(subcategory.id);
    setEditData({
      name: subcategory.name,
      slug: subcategory.slug,
      icon: subcategory.icon || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", slug: "", icon: "" });
  };

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase
      .from("subcategories")
      .update({
        name: editData.name,
        slug: editData.slug,
        icon: editData.icon,
      })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Alt kategori güncellenemedi.",
      });
      return;
    }

    toast({
      title: "Başarılı",
      description: "Alt kategori güncellendi.",
    });

    setEditingId(null);
    fetchSubcategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu alt kategoriyi silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("subcategories").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Alt kategori silinemedi.",
      });
      return;
    }

    toast({
      title: "Başarılı",
      description: "Alt kategori silindi.",
    });

    fetchSubcategories();
  };

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} Alt Kategorileri – Admin – Dijitalstok</title>
      </Helmet>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/kategoriler")}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {category.icon} {category.name} - Alt Kategoriler
            </h1>
            <p className="text-muted-foreground">Alt kategori ekleyin ve yönetin</p>
          </div>
        </div>

        {/* Add Form */}
        <div className="max-w-2xl rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Yeni Alt Kategori Ekle</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Alt Kategori Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📂"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Ekleniyor..." : "Alt Kategori Ekle"}
            </Button>
          </form>
        </div>

        {/* Subcategories List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mevcut Alt Kategoriler</h2>
          {subcategories.length === 0 ? (
            <p className="text-muted-foreground">Henüz alt kategori yok.</p>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Alt Kategori Adı</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      {editingId === subcategory.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editData.icon}
                              onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editData.slug}
                              onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSaveEdit(subcategory.id)}
                                className="text-primary hover:text-primary"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-2xl">{subcategory.icon || "📂"}</TableCell>
                          <TableCell className="font-medium">{subcategory.name}</TableCell>
                          <TableCell className="text-muted-foreground">{subcategory.slug}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(subcategory)}
                                className="text-primary hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(subcategory.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
