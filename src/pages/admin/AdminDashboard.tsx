import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BookOpen, FolderOpen, MousePointerClick, MessageSquare } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    posts: 0,
    categories: 0,
    clicks: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [productsData, postsData, categoriesData, redirectsData, messagesData] = await Promise.all([
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("posts").select("id", { count: "exact" }),
      supabase.from("categories").select("id", { count: "exact" }),
      supabase.from("redirects").select("click_count"),
      supabase.from("contact_messages").select("id", { count: "exact" }).eq("is_read", false),
    ]);

    const totalClicks = redirectsData.data?.reduce((sum, r) => sum + (r.click_count || 0), 0) || 0;

    setStats({
      products: productsData.count || 0,
      posts: postsData.count || 0,
      categories: categoriesData.count || 0,
      clicks: totalClicks,
      unreadMessages: messagesData.count || 0,
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
    {
      title: "Okunmamış Mesaj",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-primary",
      link: "/admin/mesajlar",
      highlight: stats.unreadMessages > 0,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard – Dijitalstok</title>
      </Helmet>

      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Genel istatistikler</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const cardContent = (
            <Card className={`${stat.highlight ? "ring-2 ring-primary bg-primary/5" : ""} ${stat.link ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}>
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
          );

          if (stat.link) {
            return (
              <Link key={stat.title} to={stat.link} className="block">
                {cardContent}
              </Link>
            );
          }

          return <div key={stat.title}>{cardContent}</div>;
        })}
      </div>
    </div>
    </>
  );
}
