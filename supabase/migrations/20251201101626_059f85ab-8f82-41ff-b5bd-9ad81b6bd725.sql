-- Kategoriler tablosu
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ürünler tablosu
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[],
  affiliate_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redirect yönetimi tablosu
CREATE TABLE public.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  last_checked_at TIMESTAMP WITH TIME ZONE
);

-- Blog yazıları tablosu
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  excerpt TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı profilleri (admin yönetimi için)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS politikaları
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Herkes kategorileri okuyabilir
CREATE POLICY "Herkes kategorileri görüntüleyebilir"
  ON public.categories FOR SELECT
  USING (true);

-- Herkes ürünleri okuyabilir
CREATE POLICY "Herkes ürünleri görüntüleyebilir"
  ON public.products FOR SELECT
  USING (true);

-- Herkes redirectleri okuyabilir
CREATE POLICY "Herkes redirectleri görüntüleyebilir"
  ON public.redirects FOR SELECT
  USING (true);

-- Herkes blog yazılarını okuyabilir
CREATE POLICY "Herkes blog yazılarını görüntüleyebilir"
  ON public.posts FOR SELECT
  USING (true);

-- Admin kullanıcılar kategorileri yönetebilir
CREATE POLICY "Admin kullanıcılar kategorileri ekleyebilir"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin kullanıcılar kategorileri güncelleyebilir"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin kullanıcılar ürünleri yönetebilir
CREATE POLICY "Admin kullanıcılar ürün ekleyebilir"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin kullanıcılar ürün güncelleyebilir"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin kullanıcılar ürün silebilir"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin kullanıcılar redirectleri yönetebilir
CREATE POLICY "Admin kullanıcılar redirect ekleyebilir"
  ON public.redirects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin kullanıcılar redirect güncelleyebilir"
  ON public.redirects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Herkes redirect click_count'u güncelleyebilir (anonim de dahil)
CREATE POLICY "Herkes redirect sayacını artırabilir"
  ON public.redirects FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admin kullanıcılar blog yazıları yönetebilir
CREATE POLICY "Admin kullanıcılar blog ekleyebilir"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin kullanıcılar blog güncelleyebilir"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin kullanıcılar blog silebilir"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Profiller
CREATE POLICY "Kullanıcılar kendi profillerini görüntüleyebilir"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Yeni kullanıcı profili oluşturma"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger'ları ekle
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Yeni kullanıcı kaydı için otomatik profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Başlangıç kategorileri
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Mockup', 'mockup', '🖼️'),
  ('Canva Şablonları', 'canva-sablonlari', '🎨'),
  ('Lightroom Presets', 'lightroom-presets', '📸'),
  ('Icon Pack', 'icon-pack', '⭐'),
  ('Sosyal Medya Şablonları', 'sosyal-medya-sablonlari', '📱'),
  ('AI Prompt Pack', 'ai-prompt-pack', '🤖');