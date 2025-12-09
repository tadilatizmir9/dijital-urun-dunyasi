import { useState, useEffect } from "react";
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
import { Trash2, Pencil, X, Check, FolderTree, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", slug: "", icon: "" });
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (data) {
      setCategories(data);
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
      const { error } = await supabase.from("categories").insert({
        name: formData.name,
        slug: formData.slug,
        icon: formData.icon,
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kategori eklendi.",
      });

      setFormData({ name: "", slug: "", icon: "" });
      fetchCategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kategori eklenemedi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setEditData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", slug: "", icon: "" });
  };

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase
      .from("categories")
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
        description: "Kategori güncellenemedi.",
      });
      return;
    }

    toast({
      title: "Başarılı",
      description: "Kategori güncellendi.",
    });

    setEditingId(null);
    fetchCategories();
    // Force refresh of header categories by dispatching a custom event
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  const handleToggleHomepage = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ show_on_homepage: !currentValue })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ayar güncellenemedi.",
      });
      return;
    }

    toast({
      title: "Başarılı",
      description: !currentValue ? "Ana sayfada gösterilecek." : "Ana sayfadan kaldırıldı.",
    });

    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kategori silinemedi.",
      });
      return;
    }

    toast({
      title: "Başarılı",
      description: "Kategori silindi.",
    });

    fetchCategories();
    // Force refresh of header categories by dispatching a custom event
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  return (
    <>
      <Helmet>
        <title>Kategori Yönetimi – Admin – Dijitalstok</title>
      </Helmet>

      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Kategoriler</h1>
        <p className="text-muted-foreground">Kategori ekleyin ve yönetin</p>
      </div>

      {/* Add Form */}
      <div className="max-w-2xl rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Yeni Kategori Ekle</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kategori Adı *</Label>
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
              placeholder="📁"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Ekleniyor..." : "Kategori Ekle"}
          </Button>
        </form>
      </div>

      {/* Categories List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mevcut Kategoriler</h2>
        {categories.length === 0 ? (
          <p className="text-muted-foreground">Henüz kategori yok.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Ana Sayfa</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    {editingId === category.id ? (
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
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveEdit(category.id)}
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
                      <TableCell className="text-2xl">{category.icon || "📁"}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={category.show_on_homepage}
                            onCheckedChange={() => handleToggleHomepage(category.id, category.show_on_homepage)}
                          />
                          {category.show_on_homepage && (
                            <Home className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/kategoriler/${category.id}/alt-kategoriler`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primary hover:text-primary"
                              >
                                <FolderTree className="h-4 w-4 mr-2" />
                                Alt Kategoriler
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                              className="text-primary hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
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
