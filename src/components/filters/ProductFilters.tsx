import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  selectedCategory?: string;
}

export interface FilterState {
  categoryId: string | null;
  tags: string[];
  sortBy: string;
}

export const ProductFilters = ({ onFilterChange, selectedCategory }: ProductFiltersProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    tags: [],
    sortBy: "newest",
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase
      .from("products")
      .select("tags");
    
    if (data) {
      const tagsSet = new Set<string>();
      data.forEach((product) => {
        if (product.tags) {
          product.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
      setAllTags(Array.from(tagsSet).sort());
    }
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: null,
      tags: [],
      sortBy: "newest",
    });
  };

  const hasActiveFilters = filters.categoryId || filters.tags.length > 0;

  return (
    <div className="space-y-6 mb-8">
      {/* Üst Bar: Kategori ve Sıralama */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Sol: Kategori Filtresi */}
        {!selectedCategory && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Kategori:</span>
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, categoryId: value === "all" ? null : value })
              }
            >
              <SelectTrigger className="w-[200px] rounded-full">
                <SelectValue placeholder="Tüm Kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sağ: Sıralama */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Sırala:</span>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-[150px] rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tag Filtreleri */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">Etiketler:</span>
            {allTags.slice(0, 12).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  filters.tags.includes(tag)
                    ? "bg-purple text-purple-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-purple/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aktif Filtreler */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Aktif filtreler:</span>
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.id === filters.categoryId)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, categoryId: null })}
              />
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-purple hover:underline font-medium"
          >
            Tümünü Temizle
          </button>
        </div>
      )}
    </div>
  );
};
