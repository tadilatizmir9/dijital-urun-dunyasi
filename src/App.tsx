import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AdminLayout from "@/components/admin/AdminLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import Search from "./pages/Search";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Redirect from "./pages/Redirect";
import Favorites from "./pages/Favorites";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminAddBlog from "./pages/admin/AdminAddBlog";
import AdminEditBlog from "./pages/admin/AdminEditBlog";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSubcategories from "./pages/admin/AdminSubcategories";
import AdminMessages from "./pages/admin/AdminMessages";
import Contact from "./pages/Contact";
import CerezPolitikasi from "./pages/CerezPolitikasi";
import NotFound from "./pages/NotFound";
import { CookieConsent } from "@/components/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin Routes (no Header/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="urunler" element={<AdminProducts />} />
              <Route path="urun-ekle" element={<AdminAddProduct />} />
              <Route path="urun-duzenle/:id" element={<AdminAddProduct />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="blog-ekle" element={<AdminAddBlog />} />
              <Route path="blog-duzenle/:id" element={<AdminEditBlog />} />
              <Route path="kategoriler" element={<AdminCategories />} />
              <Route path="kategoriler/:categoryId/alt-kategoriler" element={<AdminSubcategories />} />
              <Route path="mesajlar" element={<AdminMessages />} />
            </Route>

            {/* Public Routes (with Header/Footer) */}
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/urunler" element={<Products />} />
                    <Route path="/urun/:id" element={<ProductDetail />} />
                    <Route path="/kategoriler" element={<Categories />} />
                    <Route path="/kategori/:slug" element={<Category />} />
                    <Route path="/arama" element={<Search />} />
                    <Route path="/favoriler" element={<Favorites />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/iletisim" element={<Contact />} />
                    <Route path="/cerez-politikasi" element={<CerezPolitikasi />} />
                    <Route path="/go/:slug" element={<Redirect />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Footer />
                  <CookieConsent />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
