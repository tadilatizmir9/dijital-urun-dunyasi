import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil, Star, Search, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const fetchProducts = async (searchQuery?: string) => {
    setLoading(true);
    
    let query = supabase
      .from("products")
      .select("*, categories(name)");

    // Apply search filter if search query exists
    if (searchQuery && searchQuery.trim().length > 0) {
      const trimmedTerm = searchQuery.trim();
      // Search by title OR slug (case-insensitive)
      query = query.or(`title.ilike.%${trimmedTerm}%,slug.ilike.%${trimmedTerm}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Search error:", error);
      // If slug column doesn't exist, fall back to title-only search
      if (error.message?.includes("slug") || error.message?.includes("column")) {
        const trimmedTerm = searchQuery?.trim() || "";
        const { data: fallbackData } = await supabase
          .from("products")
          .select("*, categories(name)")
          .ilike("title", `%${trimmedTerm}%`)
          .order("created_at", { ascending: false });
        if (fallbackData) {
          setProducts(fallbackData);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Ürünler yüklenirken bir hata oluştu.",
        });
      }
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleToggleFeatured = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ featured: !currentValue })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün güncellenemedi.",
      });
      return;
    }

    setProducts(products.map(p => 
      p.id === id ? { ...p, featured: !currentValue } : p
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ürün silinemedi.",
      });
      return;
    }

    toast({
      title: "Başarılı",
      description: "Ürün silindi.",
    });

    fetchProducts(searchTerm);
  };

  return (
    <>
      <Helmet>
        <title>Ürün Yönetimi – Admin – Dijitalstok</title>
      </Helmet>

      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ürünler</h1>
          <p className="text-muted-foreground">Tüm ürünleri yönetin</p>
        </div>
        <Link to="/admin/urun-ekle">
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Ürün adı veya slug ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 rounded-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Yükleniyor...</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">
          {searchTerm
            ? `"${searchTerm}" için sonuç bulunamadı.`
            : "Henüz ürün yok."}
        </p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görsel</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Öne Çıkar</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                          📦
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.categories?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.featured || false}
                        onCheckedChange={() => handleToggleFeatured(product.id, product.featured || false)}
                      />
                      {product.featured && <Star className="h-4 w-4 text-secondary fill-secondary" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(product.created_at).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/urun-duzenle/${product.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
    </>
  );
}
