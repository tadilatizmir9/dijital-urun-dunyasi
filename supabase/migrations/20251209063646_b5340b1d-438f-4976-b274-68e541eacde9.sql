-- Create blog categories table
CREATE TABLE public.blog_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_categories
CREATE POLICY "Herkes blog kategorilerini görüntüleyebilir" 
ON public.blog_categories FOR SELECT USING (true);

CREATE POLICY "Admin kullanıcılar blog kategorisi ekleyebilir" 
ON public.blog_categories FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin kullanıcılar blog kategorisi güncelleyebilir" 
ON public.blog_categories FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin kullanıcılar blog kategorisi silebilir" 
ON public.blog_categories FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Add category_id and tags to posts table
ALTER TABLE public.posts
ADD COLUMN category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
ADD COLUMN tags text[] DEFAULT '{}';