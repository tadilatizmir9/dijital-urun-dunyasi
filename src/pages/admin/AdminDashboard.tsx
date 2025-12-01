import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BookOpen, FolderOpen, MousePointerClick } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    posts: 0,
    categories: 0,
    clicks: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [productsData, postsData, categoriesData, redirectsData] = await Promise.all([
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("posts").select("id", { count: "exact" }),
      supabase.from("categories").select("id", { count: "exact" }),
      supabase.from("redirects").select("click_count"),
    ]);

    const totalClicks = redirectsData.data?.reduce((sum, r) => sum + (r.click_count || 0), 0) || 0;

    setStats({
      products: productsData.count || 0,
      posts: postsData.count || 0,
      categories: categoriesData.count || 0,
      clicks: totalClicks,
    });
  };

  const statCards = [
    {
      title: "Toplam Ürün",
      value: stats.products,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Blog Yazıları",
      value: stats.posts,
      icon: BookOpen,
      color: "text-secondary",
    },
    {
      title: "Kategoriler",
      value: stats.categories,
      icon: FolderOpen,
      color: "text-primary",
    },
    {
      title: "Toplam Tıklama",
      value: stats.clicks,
      icon: MousePointerClick,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Genel istatistikler</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
