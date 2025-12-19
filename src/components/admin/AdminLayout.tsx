import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  FolderOpen,
  LogOut,
  MessageSquare,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { isTestModeOn, setTestMode as setTestModeUtil } from "@/lib/testMode";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(() => isTestModeOn());

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/admin/login");
      return;
    }

    // Check if user is admin using user_roles table
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!userRole) {
      toast({
        variant: "destructive",
        title: "Erişim reddedildi",
        description: "Admin yetkisine sahip değilsiniz.",
      });
      navigate("/");
      return;
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Çıkış yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
    navigate("/");
  };

  const handleTestModeToggle = (checked: boolean) => {
    setTestModeUtil(checked);
    setTestMode(checked);
    toast({
      title: checked ? "Test Modu Açık" : "Test Modu Kapalı",
      description: checked
        ? "Tıklamalarınız analytics'e dahil edilmeyecek."
        : "Tıklamalarınız analytics'e dahil edilecek.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Ürünler",
      href: "/admin/urunler",
      icon: Package,
    },
    {
      title: "Blog",
      href: "/admin/blog",
      icon: BookOpen,
    },
    {
      title: "Kategoriler",
      href: "/admin/kategoriler",
      icon: FolderOpen,
    },
    {
      title: "Mesajlar",
      href: "/admin/mesajlar",
      icon: MessageSquare,
    },
    {
      title: "Analiz",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Admin</span>
          </Link>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto max-w-7xl px-8 py-4">
            <div className="flex items-center justify-end gap-4">
              {/* Test Mode Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={testMode}
                  onCheckedChange={handleTestModeToggle}
                  id="test-mode"
                />
                <label
                  htmlFor="test-mode"
                  className="text-sm font-medium cursor-pointer"
                >
                  Test Modu: {testMode ? "Açık" : "Kapalı"}
                </label>
                {testMode && (
                  <Badge variant="secondary" className="text-xs">
                    Açık
                  </Badge>
                )}
              </div>
              <a
                href="https://www.dijitalstok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted transition"
              >
                Siteyi Gör
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
