-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Migrate existing admin users from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. RLS policies for user_roles table (only admins can manage roles)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Update all existing RLS policies to use has_role function

-- Categories policies
DROP POLICY IF EXISTS "Admin kullanıcılar kategorileri ekleyebilir" ON public.categories;
DROP POLICY IF EXISTS "Admin kullanıcılar kategorileri güncelleyebilir" ON public.categories;
DROP POLICY IF EXISTS "Admin kullanıcılar kategorileri silebilir" ON public.categories;

CREATE POLICY "Admin kullanıcılar kategorileri ekleyebilir"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar kategorileri güncelleyebilir"
ON public.categories FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar kategorileri silebilir"
ON public.categories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Products policies
DROP POLICY IF EXISTS "Admin kullanıcılar ürün ekleyebilir" ON public.products;
DROP POLICY IF EXISTS "Admin kullanıcılar ürün güncelleyebilir" ON public.products;
DROP POLICY IF EXISTS "Admin kullanıcılar ürün silebilir" ON public.products;

CREATE POLICY "Admin kullanıcılar ürün ekleyebilir"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar ürün güncelleyebilir"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar ürün silebilir"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Posts policies
DROP POLICY IF EXISTS "Admin kullanıcılar blog ekleyebilir" ON public.posts;
DROP POLICY IF EXISTS "Admin kullanıcılar blog güncelleyebilir" ON public.posts;
DROP POLICY IF EXISTS "Admin kullanıcılar blog silebilir" ON public.posts;

CREATE POLICY "Admin kullanıcılar blog ekleyebilir"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar blog güncelleyebilir"
ON public.posts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar blog silebilir"
ON public.posts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Blog categories policies
DROP POLICY IF EXISTS "Admin kullanıcılar blog kategorisi ekleyebilir" ON public.blog_categories;
DROP POLICY IF EXISTS "Admin kullanıcılar blog kategorisi güncelleyebilir" ON public.blog_categories;
DROP POLICY IF EXISTS "Admin kullanıcılar blog kategorisi silebilir" ON public.blog_categories;

CREATE POLICY "Admin kullanıcılar blog kategorisi ekleyebilir"
ON public.blog_categories FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar blog kategorisi güncelleyebilir"
ON public.blog_categories FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar blog kategorisi silebilir"
ON public.blog_categories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Subcategories policies
DROP POLICY IF EXISTS "Admin kullanıcılar alt kategori ekleyebilir" ON public.subcategories;
DROP POLICY IF EXISTS "Admin kullanıcılar alt kategori güncelleyebilir" ON public.subcategories;
DROP POLICY IF EXISTS "Admin kullanıcılar alt kategori silebilir" ON public.subcategories;

CREATE POLICY "Admin kullanıcılar alt kategori ekleyebilir"
ON public.subcategories FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar alt kategori güncelleyebilir"
ON public.subcategories FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar alt kategori silebilir"
ON public.subcategories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Redirects policies
DROP POLICY IF EXISTS "Admin kullanıcılar redirect ekleyebilir" ON public.redirects;
DROP POLICY IF EXISTS "Admin kullanıcılar redirect güncelleyebilir" ON public.redirects;

CREATE POLICY "Admin kullanıcılar redirect ekleyebilir"
ON public.redirects FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin kullanıcılar redirect güncelleyebilir"
ON public.redirects FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));