import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  MousePointerClick,
  BookOpen,
  TrendingUp,
  ExternalLink,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
  Eye,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message?: string; code?: string } | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalProducts: 0,
    totalClicks: 0,
    last7DaysClicks: 0,
    totalPosts: 0,
    newProducts24h: 0,
    newProducts7d: 0,
  });
  const [topClicked, setTopClicked] = useState<any[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
  const [linkHealth, setLinkHealth] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<{
    products: { date: string; count: number }[];
    posts: { date: string; count: number }[];
  }>({ products: [], posts: [] });
  const [visitorDateRange, setVisitorDateRange] = useState<24 | 7 | 30>(7);
  const [visitorStats, setVisitorStats] = useState<{
    totalViews: number;
    uniqueSessions: number;
  }>({ totalViews: 0, uniqueSessions: 0 });
  const [topPages, setTopPages] = useState<Array<{
    path: string;
    views: number;
    last_seen: string;
  }>>([]);
  const [topSources, setTopSources] = useState<Array<{
    source: string;
    views: number;
    unique_sessions: number;
  }>>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    try {
      await Promise.all([
        fetchSummaryStats(),
        fetchTopClicked(),
        fetchCategoryPerformance(),
        fetchLinkHealth(),
        fetchTrendData(),
        fetchVisitorAnalytics(),
      ]);
    } catch (e: any) {
      console.error("[AdminAnalytics] fetchAllData error:", e);
      
      // Missing table/column hatası kontrolü
      let errorMessage = "Veriler yüklenirken bir hata oluştu";
      if (e?.code === "42P01" || e?.code === "42703" || e?.message?.includes("relation") || e?.message?.includes("column")) {
        errorMessage = "Migration uygulanmamış olabilir. Supabase SQL Editor'da 20251214000000_add_click_events_and_link_health.sql dosyasını çalıştırın.";
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
      setErrorDetails({
        message: e?.message || errorMessage,
        code: e?.code,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryStats = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const productsData = await supabase.from("products").select("id", { count: "exact" });
      if (productsData.error) {
        console.error("[AdminAnalytics] fetchSummaryStats - products query error:", productsData.error);
        throw productsData.error;
      }

      const postsData = await supabase.from("posts").select("id", { count: "exact" });
      if (postsData.error) {
        console.error("[AdminAnalytics] fetchSummaryStats - posts query error:", postsData.error);
        throw postsData.error;
      }

      const redirectsData = await supabase.from("redirects").select("click_count");
      if (redirectsData.error) {
        console.error("[AdminAnalytics] fetchSummaryStats - redirects query error:", redirectsData.error);
        throw redirectsData.error;
      }

      // redirect_click_events tablosu yoksa gracefully handle et
      let clickEventsData = { count: 0, data: null, error: null };
      try {
        const clickEventsResult = await supabase
          .from("redirect_click_events")
          .select("id", { count: "exact" })
          .gte("created_at", sevenDaysAgo.toISOString());
        if (clickEventsResult.error) {
          console.warn("[AdminAnalytics] fetchSummaryStats - redirect_click_events query error (table may not exist):", clickEventsResult.error);
          // Tablo yoksa devam et, count 0 olarak kalır
        } else {
          clickEventsData = clickEventsResult;
        }
      } catch (e) {
        console.warn("[AdminAnalytics] fetchSummaryStats - redirect_click_events table not found:", e);
        // Tablo yoksa devam et
      }

      const newProducts24h = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .gte("created_at", oneDayAgo.toISOString());
      if (newProducts24h.error) {
        console.error("[AdminAnalytics] fetchSummaryStats - newProducts24h query error:", newProducts24h.error);
        throw newProducts24h.error;
      }

      const newProducts7d = await supabase
        .from("products")
        .select("id", { count: "exact" })
        .gte("created_at", sevenDaysAgo.toISOString());
      if (newProducts7d.error) {
        console.error("[AdminAnalytics] fetchSummaryStats - newProducts7d query error:", newProducts7d.error);
        throw newProducts7d.error;
      }

      const totalClicks =
        redirectsData.data?.reduce((sum, r) => sum + (r.click_count || 0), 0) || 0;

      setSummaryStats({
        totalProducts: productsData.count || 0,
        totalClicks,
        last7DaysClicks: clickEventsData.count || 0,
        totalPosts: postsData.count || 0,
        newProducts24h: newProducts24h.count || 0,
        newProducts7d: newProducts7d.count || 0,
      });
    } catch (e) {
      console.error("[AdminAnalytics] fetchSummaryStats error:", e);
      throw e;
    }
  };

  const fetchTopClicked = async () => {
    try {
      // Önce redirect_click_events'ten tıklama sayılarını ve son tıklama zamanlarını hesapla
      let clickStats = new Map<string, { count: number; lastClick: string | null }>();
      
      try {
        const { data: allEvents, error: eventsError } = await supabase
          .from("redirect_click_events")
          .select("redirect_id, created_at")
          .order("created_at", { ascending: false });
        
        if (!eventsError && allEvents) {
          // Her redirect için tıklama sayısı ve son tıklama zamanını hesapla
          allEvents.forEach((event) => {
            const existing = clickStats.get(event.redirect_id);
            if (!existing) {
              clickStats.set(event.redirect_id, {
                count: 1,
                lastClick: event.created_at,
              });
            } else {
              existing.count += 1;
              // Son tıklama zaten en son olan (order by created_at desc olduğu için)
            }
          });
        }
      } catch (error) {
        console.warn("[AdminAnalytics] fetchTopClicked - redirect_click_events table not found:", error);
      }

      // En çok tıklanan redirect'leri bul (click_click_events'ten veya redirects.click_count'dan)
      // Önce click_events'ten en çok tıklananları al, yoksa redirects.click_count kullan
      const sortedByEvents = Array.from(clickStats.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 20)
        .map(([redirectId]) => redirectId);

      // Redirect kayıtlarını çek (click_count fallback için)
      const { data: redirects, error: redirectsError } = await supabase
        .from("redirects")
        .select("id, click_count, product_id, slug")
        .in("id", sortedByEvents.length > 0 ? sortedByEvents : []);

      if (redirectsError) {
        console.error("[AdminAnalytics] fetchTopClicked - redirects query error:", redirectsError);
        // Eğer click_events yoksa, redirects.click_count kullan
        if (sortedByEvents.length === 0) {
          const { data: redirectsByCount, error: redirectsByCountError } = await supabase
            .from("redirects")
            .select("id, click_count, product_id, slug")
            .order("click_count", { ascending: false })
            .limit(20);
          
          if (redirectsByCountError) {
            throw redirectsByCountError;
          }
          
          if (!redirectsByCount || redirectsByCount.length === 0) {
            setTopClicked([]);
            return;
          }

          const productIds = redirectsByCount
            .map((r) => r.product_id)
            .filter((id): id is string => id !== null);

          const { data: products, error: productsError } = await supabase
            .from("products")
            .select("id, title, slug, categories(name)")
            .in("id", productIds);

          if (productsError) {
            console.error("[AdminAnalytics] fetchTopClicked - products query error:", productsError);
            throw productsError;
          }

          const topClickedData = redirectsByCount
            .map((redirect) => {
              const product = products?.find((p) => p.id === redirect.product_id);
              if (!product) return null;

              return {
                id: redirect.id,
                productId: product.id,
                productSlug: product.slug,
                title: product.title,
                category: product.categories?.name || "-",
                clickCount: redirect.click_count || 0,
                lastClickAt: null,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => b.clickCount - a.clickCount);

          setTopClicked(topClickedData);
          return;
        }
        throw redirectsError;
      }

      if (!redirects || redirects.length === 0) {
        setTopClicked([]);
        return;
      }

      // Product bilgilerini çek
      const productIds = redirects
        .map((r) => r.product_id)
        .filter((id): id is string => id !== null);
      
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, slug, categories(name)")
        .in("id", productIds);

      if (productsError) {
        console.error("[AdminAnalytics] fetchTopClicked - products query error:", productsError);
        throw productsError;
      }

      // Sonuçları birleştir
      const topClickedData = redirects
        .map((redirect) => {
          const product = products?.find((p) => p.id === redirect.product_id);
          const stats = clickStats.get(redirect.id);

          if (!product) return null;

          return {
            id: redirect.id,
            productId: product.id,
            productSlug: product.slug,
            title: product.title,
            category: product.categories?.name || "-",
            clickCount: stats?.count || redirect.click_count || 0,
            lastClickAt: stats?.lastClick || null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.clickCount - a.clickCount);

      setTopClicked(topClickedData);
    } catch (e) {
      console.error("[AdminAnalytics] fetchTopClicked error:", e);
      throw e;
    }
  };

  const fetchCategoryPerformance = async () => {
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name");

      if (categoriesError) {
        console.error("[AdminAnalytics] fetchCategoryPerformance - categories query error:", categoriesError);
        throw categoriesError;
      }

      if (!categories) {
        setCategoryPerformance([]);
        return;
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, category_id");

      if (productsError) {
        console.error("[AdminAnalytics] fetchCategoryPerformance - products query error:", productsError);
        throw productsError;
      }

      const { data: redirects, error: redirectsError } = await supabase
        .from("redirects")
        .select("product_id, click_count");

      if (redirectsError) {
        console.error("[AdminAnalytics] fetchCategoryPerformance - redirects query error:", redirectsError);
        throw redirectsError;
      }

      // Kategori bazında hesapla
      const categoryStats = categories.map((category) => {
        const categoryProducts = products?.filter(
          (p) => p.category_id === category.id
        ) || [];
        const productIds = categoryProducts.map((p) => p.id);
        const categoryRedirects = redirects?.filter((r) =>
          productIds.includes(r.product_id || "")
        ) || [];
        const totalClicks = categoryRedirects.reduce(
          (sum, r) => sum + (r.click_count || 0),
          0
        );
        const avgClicksPerProduct =
          categoryProducts.length > 0
            ? totalClicks / categoryProducts.length
            : 0;

        return {
          id: category.id,
          name: category.name,
          productCount: categoryProducts.length,
          totalClicks,
          avgClicksPerProduct: Math.round(avgClicksPerProduct * 100) / 100,
        };
      });

      setCategoryPerformance(
        categoryStats.sort((a, b) => b.totalClicks - a.totalClicks)
      );
    } catch (e) {
      console.error("[AdminAnalytics] fetchCategoryPerformance error:", e);
      throw e;
    }
  };

  const fetchLinkHealth = async () => {
    try {
      const { data: redirects, error: redirectsError } = await supabase
        .from("redirects")
        .select(
          "id, product_id, target_url, last_status_code, last_checked_at, last_error, is_active"
        )
        .or(
          "target_url.is.null,target_url.eq.,last_checked_at.is.null,last_status_code.gte.400,is_active.eq.false"
        )
        .order("last_checked_at", { ascending: false, nullsFirst: false });

      if (redirectsError) {
        console.error("[AdminAnalytics] fetchLinkHealth - redirects query error:", redirectsError);
        throw redirectsError;
      }

      if (!redirects || redirects.length === 0) {
        setLinkHealth([]);
        return;
      }

      const productIds = redirects
        .map((r) => r.product_id)
        .filter((id): id is string => id !== null);

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, slug")
        .in("id", productIds);

      if (productsError) {
        console.error("[AdminAnalytics] fetchLinkHealth - products query error:", productsError);
        throw productsError;
      }

      const linkHealthData = redirects.map((redirect) => {
        const product = products?.find((p) => p.id === redirect.product_id);

        // Status code'a göre label belirle
        let label = "error";
        if (redirect.last_status_code === null) {
          label = "error";
        } else if (redirect.last_status_code >= 200 && redirect.last_status_code < 400) {
          label = "ok";
        } else if (redirect.last_status_code === 404 || redirect.last_status_code === 410) {
          label = "broken";
        } else if ([401, 403, 429].includes(redirect.last_status_code)) {
          label = "blocked";
        } else if (redirect.last_status_code >= 500 && redirect.last_status_code < 600) {
          label = "error";
        } else if (redirect.last_status_code === 0) {
          label = "error";
        }

        return {
          id: redirect.id,
          productId: redirect.product_id,
          productSlug: product?.slug,
          productTitle: product?.title || "Ürün bulunamadı",
          targetUrl: redirect.target_url || "",
          lastStatusCode: redirect.last_status_code,
          lastCheckedAt: redirect.last_checked_at,
          lastError: redirect.last_error,
          isActive: redirect.is_active,
          label, // Label ekle
        };
      });

      setLinkHealth(linkHealthData);
    } catch (e) {
      console.error("[AdminAnalytics] fetchLinkHealth error:", e);
      throw e;
    }
  };

  const fetchTrendData = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (productsError) {
        console.error("[AdminAnalytics] fetchTrendData - products query error:", productsError);
        throw productsError;
      }

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (postsError) {
        console.error("[AdminAnalytics] fetchTrendData - posts query error:", postsError);
        throw postsError;
      }

      // Günlük sayımları hesapla
      const productCounts: { [key: string]: number } = {};
      const postCounts: { [key: string]: number } = {};

      products?.forEach((product) => {
        const date = new Date(product.created_at).toISOString().split("T")[0];
        productCounts[date] = (productCounts[date] || 0) + 1;
      });

      posts?.forEach((post) => {
        const date = new Date(post.created_at).toISOString().split("T")[0];
        postCounts[date] = (postCounts[date] || 0) + 1;
      });

      // Son 30 günün tüm tarihlerini oluştur
      const dates: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      const productTrend = dates.map((date) => ({
        date,
        count: productCounts[date] || 0,
      }));

      const postTrend = dates.map((date) => ({
        date,
        count: postCounts[date] || 0,
      }));

      setTrendData({ products: productTrend, posts: postTrend });
    } catch (e) {
      console.error("[AdminAnalytics] fetchTrendData error:", e);
      throw e;
    }
  };

  const fetchVisitorAnalytics = async () => {
    try {
      const days = visitorDateRange;

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_pageview_stats', {
        days,
      });

      if (statsError) {
        console.error('[AdminAnalytics] fetchVisitorAnalytics - stats error:', statsError);
        // If table doesn't exist, set defaults and continue
        if (statsError.code === '42P01' || statsError.message?.includes('relation')) {
          setVisitorStats({ totalViews: 0, uniqueSessions: 0 });
          setTopPages([]);
          setTopSources([]);
          return;
        }
        throw statsError;
      }

      // RPC bazen [{ total_views: ..., unique_sessions: ... }] döner
      const row = Array.isArray(statsData) ? statsData[0] : statsData;

      setVisitorStats({
        totalViews: Number(row?.total_views ?? 0),
        uniqueSessions: Number(row?.unique_sessions ?? 0),
      });

      // Fetch top pages
      const { data: topPagesData, error: topPagesError } = await supabase.rpc('get_pageview_top_pages', {
        days,
        page_limit: 10,
      });

      if (topPagesError) {
        console.error('[AdminAnalytics] fetchVisitorAnalytics - top pages error:', topPagesError);
        setTopPages([]);
      } else {
        setTopPages(topPagesData || []);
      }

      // Fetch sources
      const { data: sourcesData, error: sourcesError } = await supabase.rpc('get_pageview_sources', {
        days,
      });

      if (sourcesError) {
        console.error('[AdminAnalytics] fetchVisitorAnalytics - sources error:', sourcesError);
        setTopSources([]);
      } else {
        setTopSources(sourcesData || []);
      }
    } catch (e) {
      console.error('[AdminAnalytics] fetchVisitorAnalytics error:', e);
      // Don't throw - visitor analytics is optional
      setVisitorStats({ totalViews: 0, uniqueSessions: 0 });
      setTopPages([]);
      setTopSources([]);
    }
  };

  useEffect(() => {
    // Only fetch visitor analytics after initial load is complete
    if (!loading) {
      fetchVisitorAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorDateRange]);

  const handleCheckRedirect = async (redirectId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Oturum bulunamadı.",
        });
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/check-redirect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({ redirectId }),
        }
      );

      if (!response.ok) {
        throw new Error("Kontrol başarısız");
      }

      const result = await response.json();

      // Link health listesini yenile
      await fetchLinkHealth();

      // Toast mesajı göster
      if (result.ok) {
        toast({
          title: "Başarılı",
          description: result.message || "Link kontrol edildi.",
        });
      } else {
        toast({
          variant: result.label === "blocked" ? "default" : "destructive",
          title: result.label === "blocked" ? "Korunuyor" : "Uyarı",
          description: result.message || "Link kontrol edildi.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Link kontrol edilirken bir hata oluştu.",
      });
    }
  };

  const handleToggleActive = async (redirectId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("redirects")
      .update({ is_active: !currentValue })
      .eq("id", redirectId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
      });
    } else {
      toast({
        title: "Başarılı",
        description: `Link ${!currentValue ? "aktif" : "pasif"} edildi.`,
      });
      fetchLinkHealth();
    }
  };

  const getStatusBadge = (statusCode: number | null, label?: string) => {
    if (statusCode === null) return null;

    // Label varsa onu kullan, yoksa status code'a göre belirle
    let actualLabel = label;
    if (!actualLabel) {
      if (statusCode >= 200 && statusCode < 400) {
        actualLabel = "ok";
      } else if (statusCode === 404 || statusCode === 410) {
        actualLabel = "broken";
      } else if ([401, 403, 429].includes(statusCode)) {
        actualLabel = "blocked";
      } else if (statusCode >= 500 && statusCode < 600) {
        actualLabel = "error";
      } else if (statusCode === 0) {
        actualLabel = "error";
      } else {
        actualLabel = "error";
      }
    }

    if (actualLabel === "ok") {
      return <Badge className="bg-green-500">OK</Badge>;
    } else if (actualLabel === "blocked") {
      return <Badge className="bg-yellow-500 text-yellow-900">Korunuyor</Badge>;
    } else if (actualLabel === "broken") {
      return <Badge variant="destructive">Kırık ({statusCode})</Badge>;
    } else {
      return <Badge variant="destructive">Hata ({statusCode || "?"})</Badge>;
    }
  };

  const maxTrendValue = Math.max(
    ...trendData.products.map((d) => d.count),
    ...trendData.posts.map((d) => d.count),
    1
  );

  return (
    <>
      <Helmet>
        <title>Analiz – Admin – Dijitalstok</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analiz</h1>
          <p className="text-muted-foreground">Detaylı analitik ve performans metrikleri</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-semibold">Hata</p>
                  <p className="text-sm">{error}</p>
                  {import.meta.env.DEV && errorDetails && (
                    <div className="mt-3 p-3 bg-muted rounded-md text-xs font-mono">
                      <p className="text-muted-foreground mb-1">Debug Info (Development):</p>
                      {errorDetails.message && (
                        <p className="text-foreground">Message: {errorDetails.message}</p>
                      )}
                      {errorDetails.code && (
                        <p className="text-foreground">Code: {errorDetails.code}</p>
                      )}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => fetchAllData()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tekrar Dene
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList>
              <TabsTrigger value="summary">Özet</TabsTrigger>
              <TabsTrigger value="link-health">Link Sağlığı</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              {/* Özet Kartları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
                    <Package className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.totalProducts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Tıklama</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.totalClicks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Son 7 Gün</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.last7DaysClicks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Blog Yazıları</CardTitle>
                    <BookOpen className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.totalPosts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Yeni Ürün</CardTitle>
                    <Package className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summaryStats.newProducts24h}</div>
                    <p className="text-xs text-muted-foreground mt-1">Son 24 saat</p>
                    <p className="text-xs text-muted-foreground">{summaryStats.newProducts7d} (7 gün)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Ziyaretçi Analitiği */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Ziyaretçi Analitiği (First-party)
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={visitorDateRange === 24 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVisitorDateRange(24)}
                      >
                        24h
                      </Button>
                      <Button
                        variant={visitorDateRange === 7 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVisitorDateRange(7)}
                      >
                        7d
                      </Button>
                      <Button
                        variant={visitorDateRange === 30 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVisitorDateRange(30)}
                      >
                        30d
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visitor Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Sayfa Görüntüleme</CardTitle>
                        <Eye className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{visitorStats.totalViews.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Son {visitorDateRange === 24 ? '24 saat' : visitorDateRange === 7 ? '7 gün' : '30 gün'}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Benzersiz Oturum</CardTitle>
                        <Users className="h-4 w-4 text-secondary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{visitorStats.uniqueSessions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Son {visitorDateRange === 24 ? '24 saat' : visitorDateRange === 7 ? '7 gün' : '30 gün'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Pages Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">En Çok Ziyaret Edilen Sayfalar</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sayfa</TableHead>
                          <TableHead>Görüntüleme</TableHead>
                          <TableHead>Son Görüntüleme</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topPages.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Veri bulunamadı
                            </TableCell>
                          </TableRow>
                        ) : (
                          topPages.map((page, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{page.path}</TableCell>
                              <TableCell>{page.views.toLocaleString()}</TableCell>
                              <TableCell>
                                {page.last_seen
                                  ? new Date(page.last_seen).toLocaleDateString("tr-TR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Sources Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Traffic Kaynakları</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kaynak</TableHead>
                          <TableHead>Görüntüleme</TableHead>
                          <TableHead>Benzersiz Oturum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topSources.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              Veri bulunamadı
                            </TableCell>
                          </TableRow>
                        ) : (
                          topSources.map((source, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {source.source === 'direct' ? 'Doğrudan' : 
                                 source.source === 'google' ? 'Google' :
                                 source.source === 'facebook' ? 'Facebook' :
                                 source.source === 'instagram' ? 'Instagram' :
                                 source.source === 'twitter' ? 'Twitter' :
                                 source.source === 'linkedin' ? 'LinkedIn' :
                                 source.source === 'referral' ? 'Referans' :
                                 source.source}
                              </TableCell>
                              <TableCell>{source.views.toLocaleString()}</TableCell>
                              <TableCell>{source.unique_sessions.toLocaleString()}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* En Çok Tıklananlar */}
              <Card>
                <CardHeader>
                  <CardTitle>En Çok Tıklananlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün Adı</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tıklama</TableHead>
                        <TableHead>Son Tıklama</TableHead>
                        <TableHead className="text-right">Aksiyon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topClicked.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Veri bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        topClicked.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.clickCount}</TableCell>
                            <TableCell>
                              {item.lastClickAt
                                ? new Date(item.lastClickAt).toLocaleDateString("tr-TR")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                >
                                  <a
                                    href={`/urun/${item.productSlug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Ürüne Git
                                  </a>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/admin/urun-duzenle/${item.productId}`}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Kategori Performansı */}
              <Card>
                <CardHeader>
                  <CardTitle>Kategori Performansı</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Ürün Sayısı</TableHead>
                        <TableHead>Toplam Tıklama</TableHead>
                        <TableHead>Ürün Başına Tıklama</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryPerformance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Veri bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        categoryPerformance.map((cat) => (
                          <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>{cat.productCount}</TableCell>
                            <TableCell>{cat.totalClicks}</TableCell>
                            <TableCell>{cat.avgClicksPerProduct}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="link-health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Link Sağlığı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Target URL</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Son Kontrol</TableHead>
                        <TableHead className="text-right">Aksiyon</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkHealth.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Tüm linkler sağlıklı görünüyor
                          </TableCell>
                        </TableRow>
                      ) : (
                        linkHealth.map((link) => (
                          <TableRow key={link.id}>
                            <TableCell className="font-medium">{link.productTitle}</TableCell>
                            <TableCell className="max-w-xs truncate">{link.targetUrl || "-"}</TableCell>
                            <TableCell>
                              {getStatusBadge(link.lastStatusCode, link.label)}
                              {!link.isActive && (
                                <Badge variant="secondary" className="ml-2">Pasif</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {link.lastCheckedAt
                                ? new Date(link.lastCheckedAt).toLocaleDateString("tr-TR")
                                : "Kontrol edilmedi"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCheckRedirect(link.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Kontrol Et
                                </Button>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={link.isActive}
                                    onCheckedChange={() =>
                                      handleToggleActive(link.id, link.isActive)
                                    }
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {link.isActive ? "Aktif" : "Pasif"}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trend" className="space-y-6">
              {/* Ürün Trend Grafiği */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Son 30 Gün - Ürün Ekleme Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-1">
                    {trendData.products.map((item, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1 group"
                      >
                        <div
                          className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                          style={{
                            height: `${(item.count / maxTrendValue) * 100}%`,
                            minHeight: item.count > 0 ? "4px" : "0",
                          }}
                          title={`${new Date(item.date).toLocaleDateString("tr-TR")}: ${item.count} ürün`}
                        />
                        {index % 5 === 0 && (
                          <span className="text-xs text-muted-foreground transform -rotate-45 origin-left">
                            {new Date(item.date).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Blog Trend Grafiği */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Son 30 Gün - Blog Yayınlama Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-1">
                    {trendData.posts.map((item, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1 group"
                      >
                        <div
                          className="w-full bg-secondary rounded-t transition-all hover:bg-secondary/80"
                          style={{
                            height: `${(item.count / maxTrendValue) * 100}%`,
                            minHeight: item.count > 0 ? "4px" : "0",
                          }}
                          title={`${new Date(item.date).toLocaleDateString("tr-TR")}: ${item.count} yazı`}
                        />
                        {index % 5 === 0 && (
                          <span className="text-xs text-muted-foreground transform -rotate-45 origin-left">
                            {new Date(item.date).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}

